/**
 * @author Robert Z. J. Norris-Karr {@link https://github.com/rzjnzk}
 */

const stylelint = require("stylelint");

const ruleNameSCSSUndefined = "variable-usage/scss-undefined-vars";
const ruleNameSCSSUnused = "variable-usage/unused-vars-scss";

function collectVariableDefinitions(root)
{
    const variableDefinitions = new Map();

    root.walkDecls(decl =>
    {
        if(decl.prop.startsWith("$"))
        {
            variableDefinitions.set(decl.prop, decl);
        }
    });

    return variableDefinitions;
}

function collectVariableUsages(root)
{
    const variableUsages = new Map();

    root.walkDecls(decl =>
    {
        const variableMatches = decl.value.match(/\$[-_a-zA-Z0-9]+/g);

        if(variableMatches)
        {
            variableMatches.forEach(variable =>
            {
                variableUsages.set(variable, decl);
            });
        }
    });

    return variableUsages;
}

const pluginSCSSUndefined = stylelint.createPlugin(ruleNameSCSSUndefined, function(options)
{
    return function(root, result)
    {
        // If not valid options.
        if(!stylelint.utils.validateOptions(result, ruleNameSCSSUndefined, { actual: options }))
        {
            return;
        }

        // Check for undefined variables.
        collectVariableUsages(root).forEach((decl, variable) =>
        {
            if(!collectVariableDefinitions(root).has(variable))
            {
                stylelint.utils.report({
                    ruleName: ruleNameUndefined,
                    result: result,
                    node: decl,
                    message: `Undefined variable: ${variable}`,
                    word: variable
                });
            }
        });

    };
});

const pluginSCSSUnused = stylelint.createPlugin(ruleNameSCSSUnused, function(options)
{
    return function(root, result)
    {
        // If not valid options.
        if(!stylelint.utils.validateOptions(result, ruleNameUnused, { actual: options }))
        {
            return;
        }

        // Check for unused variables.
        collectVariableDefinitions(root).forEach((decl, variable) =>
        {
            if(!collectVariableUsages(root).has(variable))
            {
                stylelint.utils.report({
                    ruleName: ruleNameUnused,
                    result: result,
                    node: decl,
                    message: `Unused variable: ${variable}`,
                    word: variable
                });
            }
        });
    };
});

module.exports = [pluginSCSSUndefined, pluginSCSSUnused];
