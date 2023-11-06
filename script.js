const ipt_num=document.getElementById('ipt_num');
const bt_generate=document.getElementById('bt_generate');
const bt_start=document.getElementById('bt_start');
const lb_result=document.getElementById('lb_result')
let textContent;
let index=0;
let numberWords=0;
let color_undo='rgb(247, 247, 247)';
let color_doing='rgb(230, 230, 230)';
let startTime=null;

//bt_開始監聽鍵盤
bt_start.onclick=()=>{
  bt_start.disabled = true;
  startTime = new Date();
  window.addEventListener('keydown', keydownHandler);
  //確認讀取到txt有內容後游標指定第一個字
  if(textContent.length>0){
    const control=document.getElementById(`div1`);
    control.className='wordsNext';
  }
}

//處理監聽事件
function keydownHandler(event){
    //console.log(`Key Down: Key Code - ${event.key}, Key Name - ${event.key}`);
    let controlPrevious=document.getElementById(`div${index}`);
    let control=document.getElementById(`div${index+1}`);
    let controlNext=document.getElementById(`div${index+2}`);
    let key=event.key;
    //滾動到該div位置
    control.scrollIntoView({
      behavior: 'smooth' 
    });
    //事件處理
    if(key=='Enter')
      key='\n'
    else if(key=='Shift')
      return;
    if(key=='Backspace'){
      voiceTyping();
      if(index==ipt_num.value){
        index--;
        controlPrevious.className='wordsNext';
      }else{
        control.className='wordsUndo';
        controlPrevious.className='wordsNext';
        index--;
      }
      if(index<0)
        index=0;
    }//輸入正確
    else if(key==textContent[index]){
      voiceTyping();
      control.className='wordsTrue';
      if(index<ipt_num.value-1){
        controlNext.className='wordsNext';
      }
      index++;
      //輸入結束
      if(index==ipt_num.value){
        window.removeEventListener('keydown', keydownHandler);
        getResult();
      }
    }//輸入錯誤
    else{
      voiceFalse();
      if(index<ipt_num.value){
        index++;
      }
      console.log(key+", "+textContent[index]+","+index);
      control.className='wordsFalse';
      controlNext.className='wordsNext';

    }
    if(key===' '){
      event.preventDefault();
    }
  }

//bt_生成文章
bt_generate.onclick=()=>{
  //disableUI
  bt_generate.disabled = true;
  ipt_num.disabled = true;
  //宣告
  const container = document.getElementById('div_article');
  let divLetter;
  let divWord;
  let divParagraph;
  //回圈安排txt內容動態創建div
  divParagraph = document.createElement('div');
  divWord = document.createElement('div');
  divWord.style.display = 'inline-block'; 
  for (let i = 0; i <ipt_num.value; i++) {
    divLetter = document.createElement('div');
    switch (textContent[i]) {
      case ' ':
        divLetter.innerHTML = '&nbsp;';
        break;
      case '\n':
        divLetter.innerHTML = '⏎';
        break;
      default:
        divLetter.textContent = textContent[i];
      break;
    }
    divLetter.style.display = 'inline-block';
    divLetter.style.width = '18px';
    divLetter.style.textAlign = 'center';
    divLetter.id = `div${i + 1}`; 
    divLetter.className  = `wordsUndo`; 
    divWord.appendChild(divLetter); 
    //單字分div
    if(textContent[i]==' '||textContent[i]=='\n'){
      divParagraph.appendChild(divWord); 
      divWord = document.createElement('div');
      divWord.style.display = 'inline-block'; 
      numberWords++;
      //段落分div
      if(textContent[i]=='\n'){
        container.appendChild(divParagraph); 
        divParagraph = document.createElement('div');
      }
    }
    //如果最後一段不是\n
    if(i==ipt_num.value-1 && textContent[i]!='\n'){
      divParagraph.appendChild(divWord); 
      container.appendChild(divParagraph); 
    }
  }
}

//讀取文章
fetch('article.txt')
  .then(response => response.text())
  .then(data => {
    //讀取txt內容
    textContent = data.trim();
    textContent = textContent.replace(/\r\n/g, '\n');
    //設定文章長度輸入最大數字
    ipt_num.max=textContent.length;
    ipt_num.value=textContent.length;
  })
  .catch(error => {
    console.error('读取文件时出错：', error);
});

//撥放錯誤音
function voiceFalse(){
  const audioFalse = new Audio('voice-false.mp3');
  audioFalse.play();
  }
//撥放打字音
function voiceTyping(){
  const audioTyping = new Audio('voice-typing.mp3');
  audioTyping.play();
  }

//結算結果
function getResult(){
  let endTime = new Date();
  let spendtime = Math.floor((endTime - startTime) / 1000);
  let WPM=Math.floor(numberWords/spendtime*60);
  lb_result.innerText="time:"+spendtime+"s,  WPM:"+WPM;
}
