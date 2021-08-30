const {CompositeDisposable} = require('atom')

module.exports = {
  subscriptions: null,

  activate () {
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.commands.add('atom-workspace',
      {'game-of-life:step': () => this.step()})
    )
  },

  deactivate () {
    this.subscriptions.dispose()
  },

  step() {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      editor.mutateSelectedText((s,snum) =>{
        const selection = s.getText();
        const lines = selection.split("\n");
        let maxlen = 0;
        lines.forEach((line, i) => {
          maxlen = Math.max(line.length,maxlen);
        });
        console.log(maxlen);

        // set up our variables
        let newlines = [];
        let isalive = [];
        let localNeighbors = [[],[],[]]; // localNeighbors[1] is the active line
        for (let i = 0; i < maxlen; i++) {
          localNeighbors[0].push([]);
          localNeighbors[1].push([]);
          localNeighbors[2].push([]);
        }
        const compass = [[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1]];

        // run game of life algorithm
        lines.forEach((line, i) => {
          let newisalive = [];
          for(let j = 0; j<line.length; j++){
            let c = line.slice(j,j+1);
            if(!(c === " ")){
              newisalive.push(true);
              compass.forEach((dir) => {
                if(dir[1]+j >= 0 && dir[1]+j < maxlen){
                  //console.log(localNeighbors[dir[0]+1][dir[1]+j]);
                  localNeighbors[dir[0]+1][dir[1]+j].push(c);
                }
              });
            }else{
              newisalive.push(false);
            }
          }

          if(i>0){
            //console.log(localNeighbors[0]);
            let newline = "";
            for(let j = 0; j<maxlen; j++){
              const ln = localNeighbors[0][j];
              if((isalive[j] && ln.length == 2) || ln.length == 3){
                const index = Math.floor(Math.random() * ln.length);
                newline = newline.concat(ln[index]);
              }else{
                newline = newline.concat(" ");
              }
            }
            newlines.push(newline);
          }

          localNeighbors.shift();
          localNeighbors.push([]);
          for(let j = 0; j<maxlen; j++){
            localNeighbors[2].push([]);
          }

          isalive = newisalive;
        });
        // add the final line
        let newline = "";
        for(let j = 0; j<maxlen; j++){
          const ln = localNeighbors[0][j];
          if((isalive[j] && ln.length == 2) || ln.length == 3){
            const index = Math.floor(Math.random() * ln.length);
            newline = newline.concat(ln[index]);
          }else{
            newline = newline.concat(" ");
          }
        }
        newlines.push(newline);

        // compile the lines
        // console.log(newlines);
        let newtext = "";
        newlines.forEach((line, i) => {
          newtext = newtext.concat(line);
          if(i!=newlines.length-1){
            newtext = newtext.concat("\n");
          }
        });

        s.insertText(newtext,{"select":true});
      });
    }
  }
}
