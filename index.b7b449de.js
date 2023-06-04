const e=Object.freeze({SLOT_MACHINE_SIZE:3,REEL_SIZE:60,REEL_OFFSET:3,ANIMATION_DELAY:1e3,ANIMATION_DURATION:2e3,SYMBOL_QTY:4,SPIN_BUTTON_DELAY:800});Object.freeze({BAR:"0",SEVEN:"1",CHERRY:"2",BELL:"3"});const t=new(window.AudioContext||window.webkitAudioContext);class i{constructor(e){this.audioCtx=e,this.gainNode=this.audioCtx.createGain(),this.gainNode.connect(e.destination),this.gainNode.gain.value=.125,this.trackList=this.loadTracks()}loadTracks(){let e=document.querySelectorAll("audio"),t=[];return e.forEach(e=>{let i=document.querySelector(`#${e.id}`),s=this.audioCtx.createMediaElementSource(i);s.connect(this.gainNode),t.push({name:e.id,htmlMediaElement:i,mediaElementAudioSourceNode:s})}),t}async playTrack(e){this.trackList.forEach(t=>{t.name===e&&t.htmlMediaElement.play()})}}new class{constructor(){this.reel_animations=[],this.previous_reel=[],this.finished_reels=0,this.result=[],this.audioMachine=new i(t),this.score=0,this.betValue=10,this.initPreviousReelObj(),this.createSlotMachine(e.SLOT_MACHINE_SIZE),this.createSpinButton(),this.getScore(),this.changeScore(0)}initPreviousReelObj(){for(let t=0;t<e.SLOT_MACHINE_SIZE;t++)this.previous_reel.push({slotNumber:t,symbolList:[]})}createSpinButton(){this.spinButton=document.getElementsByClassName("spin-button")[0],this.spinButton.addEventListener("click",()=>{this.spinButton.setAttribute("class","spin-button spin-button-clicked"),setTimeout(()=>{this.spinButton.setAttribute("class","spin-button")},e.SPIN_BUTTON_DELAY),this.spin()})}createSlotMachine(e){this.container=document.getElementsByClassName("slot-machine")[0],this.container.innerHTML="",this.reel_animations=[];for(let t=0;t<e;t++)this.reel_animations.push(this.createReel(t))}createReel(t){let i=document.createElement("div");i.setAttribute("class","reel"),i.setAttribute("id",`slot_${t}`);for(let t=0;t<=e.REEL_SIZE;t++){let t=Math.floor(Math.random()*e.SYMBOL_QTY),s=`<div class="symbol symbol_${t}" id="${t}"></div>`;i.innerHTML=i.innerHTML+s}return this.previousReelChange(t,i),this.container.appendChild(i),this.createReelAnimation(i)}previousReelChange(t,i){this.previous_reel.forEach(s=>{s.slotNumber===t&&(0===s.symbolList.length?i.prepend(i.children.item(i.children.length-e.REEL_OFFSET-1).cloneNode(!0),i.children.item(i.children.length-e.REEL_OFFSET).cloneNode(!0),i.children.item(i.children.length-e.REEL_OFFSET+1).cloneNode(!0)):i.prepend(...s.symbolList),s.symbolList=[],s.symbolList.push(i.children.item(i.children.length-e.REEL_OFFSET-1),i.children.item(i.children.length-e.REEL_OFFSET),i.children.item(i.children.length-e.REEL_OFFSET+1)))})}createReelAnimation(t){let i=document.getElementsByClassName("symbol")[0].clientHeight,s=[{transform:"translateY(0)"},{transform:`translateY(-${t.clientHeight-4*i}px)`}],n={delay:Math.floor(Math.random()*e.ANIMATION_DELAY),duration:e.ANIMATION_DURATION,easing:"cubic-bezier(.52,.08,.45,1.19)",iterations:1,direction:"normal",fill:"forwards"},o=t.animate(s,n);return o.cancel(),o.onfinish=()=>{this.finished_reels=this.finished_reels+1,this.finished_reels===e.SLOT_MACHINE_SIZE&&(this.getResult(),this.finished_reels=0)},o}spin(){this.changeScore(-this.betValue),this.createSlotMachine(e.SLOT_MACHINE_SIZE),setTimeout(()=>{this.audioMachine.playTrack("audio_wheel")},e.SPIN_BUTTON_DELAY),this.reel_animations.forEach(e=>{e.play()})}getResult(){this.result=[];for(let t=0;t<e.SLOT_MACHINE_SIZE;t++){let i=document.getElementById(`slot_${t}`).children.length-e.REEL_OFFSET;this.result.push(document.getElementById(`slot_${t}`).children[i].getAttribute("id"))}this.checkResult(this.result)}checkResult(e){let t=Array.from(new Set(e));if(console.log(t),1===t.length)"1"===t[0]&&this.changeScore(1e3),"3"===t[0]&&this.changeScore(80),"2"===t[0]&&this.changeScore(40),"0"===t[0]&&this.changeScore(20);else if(2===t.length){let t=0;e.forEach(e=>{"2"===e&&t++}),1===t?this.changeScore(5):2===t?this.changeScore(2):this.changeScore(0)}else{let e=!1;t.forEach(t=>{"2"===t&&(e=!0)}),e?this.changeScore(2):this.changeScore(0)}}getScore(){let e=localStorage.getItem("slot-machine-score");null===e?(localStorage.setItem("slot-machine-score","100"),this.getScore()):this.score=Number(e)}changeScore(e){this.score=this.score+e*this.betValue,console.log("score:",this.score," x:",e),localStorage.setItem("slot-machine-score",this.score.toString());let t=document.getElementsByClassName("score")[0];t.innerHTML=`$ ${this.score.toString()}`}};
//# sourceMappingURL=index.b7b449de.js.map
