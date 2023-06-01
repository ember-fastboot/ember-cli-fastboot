/* eslint-disable prettier/prettier */
/* eslint-env node */
const recast = require('recast');
const { readFileSync, writeFileSync } = require('fs');

module.exports = {
  description: '',
  normalizeEntityName() {
    // no-op
  },

  afterInstall() {
    let targetsFile = './config/targets.js'

    if(this.project.isEmberCLIAddon()) {
      targetsFile = './tests/dummy/config/targets.js';
    }

    const targetsAst = recast.parse(readFileSync(targetsFile));

    recast.visit(targetsAst, {
      visitAssignmentExpression (path) {
        let node = path.node;

        if (node.left.object.name === 'module' && node.left.property.name === 'exports') {
          let nodeProperty = node.right.properties.find(property => property.key.name === 'node');

          if(!nodeProperty) {
            let builders = recast.types.builders;
            nodeProperty = builders.property(
              'init',
              builders.identifier('node'),
              builders.literal('current')
            );
            node.right.properties.push(nodeProperty);
          }
        }

        this.traverse(path);
      }
    });

    writeFileSync(targetsFile, recast.print(targetsAst, { tabWidth: 2, quote: 'single' }).code);
  }
};
