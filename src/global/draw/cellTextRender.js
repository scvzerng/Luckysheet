import Store from "../../store";
function cellTextRender(textInfo, ctx, option) {
  if (textInfo == null) {
    return;
  }
  let values = textInfo.values;
  let pos_x = option.pos_x,
    pos_y = option.pos_y;
  if (values == null) {
    return;
  }
  // console.log(textInfo, pos_x, pos_y, values[0].width, values[0].left, ctx);

  // for(let i=0;i<values.length;i++){
  //     let word = values[i];
  //     ctx.font = word.style;
  //     ctx.fillText(word.content, (pos_x + word.left)/Store.zoomRatio, (pos_y+word.top)/Store.zoomRatio);
  // }

  // ctx.fillStyle = "rgba(255,255,0,0.2)";
  // ctx.fillRect((pos_x + values[0].left)/Store.zoomRatio, (pos_y+values[0].top-values[0].asc)/Store.zoomRatio, textInfo.textWidthAll, textInfo.textHeightAll)

  if (textInfo.rotate != 0 && textInfo.type != "verticalWrap") {
    ctx.save();
    ctx.translate((pos_x + textInfo.textLeftAll) / Store.zoomRatio, (pos_y + textInfo.textTopAll) / Store.zoomRatio);
    ctx.rotate(-textInfo.rotate * Math.PI / 180);
    ctx.translate(-(textInfo.textLeftAll + pos_x) / Store.zoomRatio, -(pos_y + textInfo.textTopAll) / Store.zoomRatio);
  }

  // ctx.fillStyle = "rgb(0,0,0)";
  for (let i = 0; i < values.length; i++) {
    let word = values[i];
    if (word.inline === true && word.style != null) {
      ctx.font = word.style.fontset;
      ctx.fillStyle = word.style.fc;
    } else {
      ctx.font = word.style;
    }

    // 鏆傛椂鏈帓鏌ュ埌word.content绗竴娆′細鏄痮bject锛屽厛鍋氫笅鍒ゆ柇鏉ユ覆鏌擄紝鍚庣画鎵惧埌闂鍐嶅鍘?
    let txt = typeof word.content === "object" ? word.content.m : word.content;
    ctx.fillText(txt, (pos_x + word.left) / Store.zoomRatio, (pos_y + word.top) / Store.zoomRatio);
    if (word.cancelLine != null) {
      let c = word.cancelLine;
      ctx.beginPath();
      ctx.moveTo(Math.floor((pos_x + c.startX) / Store.zoomRatio) + 0.5, Math.floor((pos_y + c.startY) / Store.zoomRatio) + 0.5);
      ctx.lineTo(Math.floor((pos_x + c.endX) / Store.zoomRatio) + 0.5, Math.floor((pos_y + c.endY) / Store.zoomRatio) + 0.5);
      ctx.lineWidth = Math.floor(c.fs / 9);
      ctx.strokeStyle = ctx.fillStyle;
      ctx.stroke();
      ctx.closePath();
    }
    if (word.underLine != null) {
      let underLines = word.underLine;
      for (let a = 0; a < underLines.length; a++) {
        let item = underLines[a];
        ctx.beginPath();
        ctx.moveTo(Math.floor((pos_x + item.startX) / Store.zoomRatio) + 0.5, Math.floor((pos_y + item.startY) / Store.zoomRatio));
        ctx.lineTo(Math.floor((pos_x + item.endX) / Store.zoomRatio) + 0.5, Math.floor((pos_y + item.endY) / Store.zoomRatio) + 0.5);
        ctx.lineWidth = Math.floor(item.fs / 9);
        ctx.strokeStyle = ctx.fillStyle;
        ctx.stroke();
        ctx.closePath();
      }
    }
  }
  // ctx.fillStyle = "rgba(0,0,0,0.2)";
  // ctx.fillRect((pos_x + values[0].left)/Store.zoomRatio, (pos_y+values[0].top-values[0].asc)/Store.zoomRatio, textInfo.textWidthAll, textInfo.textHeightAll)
  // ctx.fillStyle = "rgba(255,0,0,1)";
  // ctx.fillRect(pos_x+textInfo.textLeftAll-2, pos_y+textInfo.textTopAll-2, 4,4);
  if (textInfo.rotate != 0 && textInfo.type != "verticalWrap") {
    ctx.restore();
  }
}
export { cellTextRender };