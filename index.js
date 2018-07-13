const path = require('path')
const { readdirSync, existsSync, statSync, createWriteStream } = require('fs')
const scissors = require('scissors')
const signale = require('signale')

const termsPath = path.join(__dirname, 'terms')
const grammarPath = path.join(__dirname, 'grammar')
const outputPath = path.join(__dirname, 'output')
const termFile = path.join(outputPath, 'terms.pdf')
const grammarFile = path.join(outputPath, 'grammar.pdf')

const termIndexPDF = path.join(termsPath, 'Literary Devices and Literary Terms.pdf')
const termsPDFs = [termIndexPDF]
const grammarPDFs = []

const convert = (items, filename) => new Promise((resolve, reject) => {
  signale.pending(`merging ${filename}`)
  scissors.join(...items.map(itemPath => scissors(itemPath)))
    .pdfStream()
    .pipe(createWriteStream(filename))
    .on('finish', () => {
      signale.success(`success merging ${filename}`)
      resolve()
    })
    .on('error', err => {
      signale.error(err)
    })
})

// Conver terms
for (let i = 97; i <= 122; i++) {
  const dir = path.join(termsPath, String.fromCharCode(i))
  if (existsSync(dir)) {
    const pdfs = readdirSync(dir)
      .map(file => path.join(dir, file))
      .filter(file => statSync(file).isFile() && path.extname(file) === '.pdf')

    pdfs.forEach(file => {
      termsPDFs.push(file)
    })
  }
}



// Convert grammar
readdirSync(grammarPath)
  .map(file => path.join(grammarPath, file))
  .filter(file => statSync(file).isFile() && path.extname(file) === '.pdf')
  .forEach(item => {
    grammarPDFs.push(item)
  })

convert(termsPDFs, termFile).then(() => convert(grammarPDFs, grammarFile))