const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src/function/functionListDescriptor');

function splitDescriptorFile(srcFileName, objName, subModules) {
    const srcFile = path.join(baseDir, srcFileName + '.js');
    const content = fs.readFileSync(srcFile, 'utf-8');
    const lines = content.split('\n');
    const outDir = path.join(baseDir, srcFileName);
    
    function extractLines(startLine, endLine) {
        return lines.slice(startLine - 1, endLine).join('\n');
    }
    
    fs.mkdirSync(outDir, { recursive: true });
    
    const indexImports = [];
    const indexMerges = [];
    
    for (const [modName, ranges] of Object.entries(subModules)) {
        let body = '';
        for (const [start, end] of ranges) {
            body += extractLines(start, end) + '\n';
        }
        
        // Wrap in array
        const modContent = `const ${modName} = [
${body}];

export default ${modName};
`;
        fs.writeFileSync(path.join(outDir, modName + '.js'), modContent, 'utf-8');
        console.log(`Created ${srcFileName}/${modName}.js`);
        
        indexImports.push(`import ${modName} from './${modName}';`);
        indexMerges.push(modName);
    }
    
    const indexContent = `${indexImports.join('\n')}

const ${objName} = [
${indexMerges.map(m => '    ...' + m).join(',\n')}
];

export default ${objName};
`;
    fs.writeFileSync(path.join(outDir, 'index.js'), indexContent, 'utf-8');
    console.log(`Created ${srcFileName}/index.js`);
    
    fs.writeFileSync(srcFile, `export { default } from "./${srcFileName}/index";\n`, 'utf-8');
    console.log(`Rewrote ${srcFileName}.js as re-export`);
}

// statistical.js: Split roughly in half
// First half: lines 1-675, Second half: lines 676-1347
splitDescriptorFile('statistical', 'statisticalDescriptors', {
    'statisticalDescriptorsA': [[1, 675]],
    'statisticalDescriptorsB': [[676, 1347]],
});

// financial.js: Split roughly in half
// First half: lines 1-600, Second half: lines 601-1207
splitDescriptorFile('financial', 'financialDescriptors', {
    'financialDescriptorsA': [[1, 600]],
    'financialDescriptorsB': [[601, 1207]],
});

console.log('\nAll files created successfully!');
