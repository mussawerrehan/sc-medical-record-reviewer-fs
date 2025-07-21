import { defineConfig } from 'cypress';
import { devServer } from '@cypress/webpack-dev-server';
import { getWebpackConfig } from '@cypress/webpack-dev-server/dist/helpers/angularHandler';

export default defineConfig({
  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
      options: {
        projectConfig: {
          root: '.',
          sourceRoot: 'src',
          buildOptions: {
            outputPath: 'dist',
            index: 'src/index.html',
            main: 'src/main.ts',
            polyfills: ['zone.js'],
            tsConfig: 'tsconfig.app.json',
            assets: ['src/favicon.ico', 'src/assets'],
            styles: ['src/styles.css'],
            scripts: []
          }
        }
      }
    },
    specPattern: 'cypress/component/**/*.cy.ts',
    supportFile: 'cypress/support/component.ts'
  },
  e2e: {
    baseUrl: 'http://localhost:4200',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts'
  }
});