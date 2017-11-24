import fs from 'fs'
import globby from 'globby'
import createFile from 'babel-file';
import generate from 'babel-generator';

module.exports = babel => {
  var t = babel.types;
  let variableDeclarators = []

  return {
    name: "s2s-redux-sagas-manager",
    visitor: {
      VariableDeclarator(path,state){
        variableDeclarators.push(path.node.id.name)
      },
      Program: {
        enter(path, state) {
          const { input, output } = state.opts

          if (!input) {
            throw new Error('require input option')
          }

          if (!output) {
            throw new Error('require output option')
          }

          const inputFiles = globby.sync(input)
          const outputFiles = globby.sync(output)

          const outputDirPath = output.split("/").reverse().slice(1).reverse().join("/")

          const inputFilesName = inputFiles.map(f =>  f.split("/").pop())
          const outputFilesName = outputFiles.map(f => f.split("/").pop())

          // If there is no input directory file in the output directory, create a file
          inputFilesName.map(
            f => {
              if (outputFilesName.indexOf(f) == -1){
                fs.writeFileSync( outputDirPath+"/" + f, "")
              }
            }
          )
        },
        exit(path, state){
          const { output } = state.opts

          const inputFilePath = state.file.opts.filename
          const inputFileName = inputFilePath.split("/").pop()

          const outputDirPath = output.split("/").reverse().slice(1).reverse().join("/")
          const outputFilePath = outputDirPath + "/" + inputFileName

          let outputFile
          let actionNameArray = []
          let objectPropertyArray = []

          fs.readFile(outputFilePath, (err, data) => {
            const outputFileSrc = data.toString();
            outputFile = createFile(outputFileSrc, {
              filename: outputFilePath
            })

            outputFile.path.traverse({
              FunctionDeclaration(path){
                const handleName = path.node.id.name
                const actionName = handleName.replace(/handle/, '').charAt(0).toLowerCase() + handleName.replace(/handle/, '').slice(1)
                actionNameArray.push(actionName)
              }
            })

            variableDeclarators.forEach((val,index,ar) => {
              if (actionNameArray.indexOf(val) == -1){
                outputFile.path.traverse({
                  ExportDefaultDeclaration(path){
                    path.insertBefore(t.ExpressionStatement(t.Identifier(val)))
                  }
                })
                const resultSrc = generate(outputFile.ast).code
                fs.writeFile(outputFilePath, resultSrc, (err) => { if(err) {throw err} });
              }
            })

            actionNameArray = []
            variableDeclarators = []
          })
        }
      }
    }
  }
}
