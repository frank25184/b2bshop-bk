// https://github.com/aheckmann/gm/tree/master/examples/

var gm = require('../')
  , dir = __dirname + '/imgs' 

function compress(fileIn, fileOut){
    gm(dir + fileIn)
    .minify()
    .write(dir + fileOut, function(err){
      if (err) return console.dir(arguments)
      console.log(this.outname + " created  ::  " + arguments[3])
    }
  ) 

}


module.exports = (fileIn, fileOut) => {
    return {
        compress: compress,
    }

}



