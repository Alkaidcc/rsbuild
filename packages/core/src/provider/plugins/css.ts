import {
  CSS_REGEX,
  resolvePackage,
  isUseCssExtract,
  getPostcssLoaderOptions,
  mergeChainedOptions,
  getCssLoaderOptions,
  getBrowserslistWithDefault,
  getCssModuleLocalIdentName,
  getSharedPkgCompiledPath,
  type RsbuildContext,
  type RsbuildPlugin,
  type NormalizedConfig,
  type BundlerChainRule,
  type ModifyChainUtils,
  type CSSExtractOptions,
} from '@rsbuild/shared';
import { RspackCssExtractPlugin } from '@rspack/core';

export async function applyBaseCSSRule({
  rule,
  config,
  context,
  utils: { target, isProd, isServer, CHAIN_ID, isWebWorker },
  importLoaders = 1,
}: {
  rule: BundlerChainRule;
  config: NormalizedConfig;
  context: RsbuildContext;
  utils: ModifyChainUtils;
  importLoaders?: number;
}) {
  const browserslist = await getBrowserslistWithDefault(
    context.rootPath,
    config,
    target,
  );

  // 1. Check user config
  const enableExtractCSS = isUseCssExtract(config, target);
  const enableCSSModuleTS = Boolean(config.output.enableCssModuleTSDeclaration);

  // 2. Prepare loader options
  const localIdentName = getCssModuleLocalIdentName(config, isProd);

  const cssLoaderOptions = getCssLoaderOptions({
    config,
    importLoaders,
    isServer,
    isWebWorker,
    localIdentName,
  });

  // 3. Create webpack rule
  // Order: style-loader/mini-css-extract -> css-loader -> postcss-loader
  if (!isServer && !isWebWorker) {
    // use mini-css-extract-plugin loader
    if (enableExtractCSS) {
      const extraCSSOptions: Required<CSSExtractOptions> =
        typeof config.tools.cssExtract === 'object'
          ? config.tools.cssExtract
          : {
              loaderOptions: {},
              pluginOptions: {},
            };

      rule
        .use(CHAIN_ID.USE.MINI_CSS_EXTRACT)
        .loader(RspackCssExtractPlugin.loader)
        .options(extraCSSOptions.loaderOptions)
        .end();
    }
    // use style-loader
    else {
      const styleLoaderOptions = mergeChainedOptions({
        defaults: {},
        options: config.tools.styleLoader,
      });

      rule
        .use(CHAIN_ID.USE.STYLE)
        .loader(getSharedPkgCompiledPath('style-loader'))
        .options(styleLoaderOptions)
        .end();
    }

    // use css-modules-typescript-loader
    if (enableCSSModuleTS && cssLoaderOptions.modules) {
      rule
        .use(CHAIN_ID.USE.CSS_MODULES_TS)
        .loader(
          resolvePackage(
            '@rsbuild/shared/css-modules-typescript-loader',
            __dirname,
          ),
        )
        .options({
          modules: cssLoaderOptions.modules,
        })
        .end();
    }
  } else {
    rule
      .use(CHAIN_ID.USE.IGNORE_CSS)
      .loader(resolvePackage('@rsbuild/shared/ignore-css-loader', __dirname))
      .end();
  }

  rule
    .use(CHAIN_ID.USE.CSS)
    .loader(getSharedPkgCompiledPath('css-loader'))
    .options(cssLoaderOptions)
    .end();

  if (!isServer && !isWebWorker) {
    const postcssLoaderOptions = await getPostcssLoaderOptions({
      browserslist,
      config,
      root: context.rootPath,
    });

    rule
      .use(CHAIN_ID.USE.POSTCSS)
      .loader(getSharedPkgCompiledPath('postcss-loader'))
      .options(postcssLoaderOptions)
      .end();
  }

  // CSS imports should always be treated as sideEffects
  rule.merge({ sideEffects: true });

  // Enable preferRelative by default, which is consistent with the default behavior of css-loader
  // see: https://github.com/webpack-contrib/css-loader/blob/579fc13/src/plugins/postcss-import-parser.js#L234
  rule.resolve.preferRelative(true);
}

export const pluginCss = (): RsbuildPlugin => {
  return {
    name: 'rsbuild:css',
    setup(api) {
      api.modifyBundlerChain(async (chain, utils) => {
        const rule = chain.module.rule(utils.CHAIN_ID.RULE.CSS);
        const config = api.getNormalizedConfig();
        rule.test(CSS_REGEX);
        await applyBaseCSSRule({
          rule,
          utils,
          config,
          context: api.context,
        });
      });

      api.modifyRspackConfig(async (rspackConfig) => {
        rspackConfig.experiments ||= {};
        rspackConfig.experiments.css = false;
        rspackConfig.experiments.rspackFuture ||= {};
        rspackConfig.experiments.rspackFuture.newTreeshaking = true;
      });
    },
  };
};
