import { onNS, offNS } from '../../utils/migrationHelpers.js';
import { replaceHtml } from '../../utils/util';
import { showModalMask, hideModalMask } from '../../utils/domUtils.js';
import { modelHTML } from '../constant';
import menuButton from '../menuButton';
import editor from '../../global/editor';
import tooltip from '../../global/tooltip';
import { isEditMode } from '../../global/validate';
import Store from '../../store';
import locale from '../../locale/locale';
import { moneyFmtList as defaultMoneyFmtList, dateFmtList as defaultDateFmtList, numFmtList as defaultNumFmtList } from './formatData';

const luckysheetMoreFormat = {
    moneyFmtList: defaultMoneyFmtList,
    dateFmtList: defaultDateFmtList,
    numFmtList: defaultNumFmtList,
    createDialog: function(type){
        let _this = this;

        const currencyDetail = locale().currencyDetail;
        const locale_format = locale().format;
        const locale_button = locale().button;

        this.moneyFmtList = [
            {'name': currencyDetail.RMB,'pos': 'before','value': '¥'},
            {'name': currencyDetail.USdollar,'pos': 'before','value': '$'},
            {'name': currencyDetail.EUR,'pos': 'before','value': '€'},
            {'name': currencyDetail.GBP,'pos': 'before','value': '￡'},
            {'name': currencyDetail.HK,'pos': 'before','value': '$'},
            {'name': currencyDetail.JPY,'pos': 'before','value': '￥'},
            {'name': currencyDetail.AlbanianLek,'pos': 'before','value': 'Lek'},
            {'name': currencyDetail.AlgerianDinar,'pos': 'before','value': 'din'},
            {'name': currencyDetail.Afghani,'pos': 'after','value': 'Af'},
            {'name': currencyDetail.ArgentinePeso,'pos': 'before','value': '$'},
            {'name': currencyDetail.UnitedArabEmiratesDirham,'pos': 'before','value': 'dh'},
            {'name': currencyDetail.ArubanFlorin,'pos': 'before','value': 'Afl'},
            {'name': currencyDetail.OmaniRial,'pos': 'before','value': 'Rial'},
            {'name': currencyDetail.Azerbaijanimanat,'pos': 'before','value': '?'},
            {'name': currencyDetail.EgyptianPound,'pos': 'before','value': '￡'},
            {'name': currencyDetail.EthiopianBirr,'pos': 'before','value': 'Birr'},
            {'name': currencyDetail.AngolaKwanza,'pos': 'before','value': 'Kz'},
            {'name': currencyDetail.AustralianDollar,'pos': 'before','value': '$'},
            {'name': currencyDetail.Patacas,'pos': 'before','value': 'MOP'},
            {'name': currencyDetail.BarbadosDollar,'pos': 'before','value': '$'},
            {'name': currencyDetail.PapuaNewGuineaKina,'pos': 'before','value': 'PGK'},
            {'name': currencyDetail.BahamianDollar,'pos': 'before','value': '$'},
            {'name': currencyDetail.PakistanRupee,'pos': 'before','value': 'Rs'},
            {'name': currencyDetail.ParaguayanGuarani,'pos': 'after','value': 'Gs'},
            {'name': currencyDetail.BahrainiDinar,'pos': 'before','value': 'din'},
            {'name': currencyDetail.PanamanianBalboa,'pos': 'before','value': 'B/'},
            {'name': currencyDetail.Brazilianreal,'pos': 'before','value': 'R$'},
            {'name': currencyDetail.Belarusianruble,'pos': 'after','value': 'р'},
            {'name': currencyDetail.BermudianDollar,'pos': 'before','value': '$'},
            {'name': currencyDetail.BulgarianLev,'pos': 'before','value': 'lev'},
            {'name': currencyDetail.IcelandKrona,'pos': 'before','value': 'kr'},
            {'name': currencyDetail.BosniaHerzegovinaConvertibleMark,'pos': 'before','value': 'KM'},
            {'name': currencyDetail.PolishZloty,'pos': 'after','value': 'z?'},
            {'name': currencyDetail.Boliviano,'pos': 'before','value': 'Bs'},
            {'name': currencyDetail.BelizeDollar,'pos': 'before','value': '$'},
            {'name': currencyDetail.BotswanaPula,'pos': 'before','value': 'P'},
            {'name': currencyDetail.NotDannuzhamu,'pos': 'before','value': 'Nu'},
            {'name': currencyDetail.BurundiFranc,'pos': 'before','value': 'FBu'},
            {'name': currencyDetail.NorthKoreanWon,'pos': 'before','value': '?KP'},
            {'name': currencyDetail.DanishKrone,'pos': 'after','value': 'kr'},
            {'name': currencyDetail.EastCaribbeanDollar,'pos': 'before','value': '$'},
            {'name': currencyDetail.DominicaPeso,'pos': 'before','value': 'RD$'},
            {'name': currencyDetail.RussianRuble,'pos': 'after','value': '?'},
            {'name': currencyDetail.EritreanNakfa,'pos': 'before','value': 'Nfk'},
            {'name': currencyDetail.CFAfranc,'pos': 'before','value': 'CFA'},
            {'name': currencyDetail.PhilippinePeso,'pos': 'before','value': '?'},
            {'name': currencyDetail.FijiDollar,'pos': 'before','value': '$'},
            {'name': currencyDetail.CapeVerdeEscudo,'pos': 'before','value': 'CVE'},
            {'name': currencyDetail.FalklandIslandsPound,'pos': 'before','value': '￡'},
            {'name': currencyDetail.GambianDalasi,'pos': 'before','value': 'GMD'},
            {'name': currencyDetail.Congolesefranc,'pos': 'before','value': 'FrCD'},
            {'name': currencyDetail.ColombianPeso,'pos': 'before','value': '$'},
            {'name': currencyDetail.CostaRicanColon,'pos': 'before','value': '?'},
            {'name': currencyDetail.CubanPeso,'pos': 'before','value': '$'},
            {'name': currencyDetail.Cubanconvertiblepeso,'pos': 'before','value': '$'},
            {'name': currencyDetail.GuyanaDollar,'pos': 'before','value': '$'},
            {'name': currencyDetail.KazakhstanTenge,'pos': 'before','value': '?'},
            {'name': currencyDetail.Haitiangourde,'pos': 'before','value': 'HTG'},
            {'name': currencyDetail.won,'pos': 'before','value': '?'},
            {'name': currencyDetail.NetherlandsAntillesGuilder,'pos': 'before','value': 'NAf.'},
            {'name': currencyDetail.Honduraslempiras,'pos': 'before','value': 'L'},
            {'name': currencyDetail.DjiboutiFranc,'pos': 'before','value': 'Fdj'},
            {'name': currencyDetail.KyrgyzstanSom,'pos': 'before','value': 'KGS'},
            {'name': currencyDetail.GuineaFranc,'pos': 'before','value': 'FG'},
            {'name': currencyDetail.CanadianDollar,'pos': 'before','value': '$'},
            {'name': currencyDetail.GhanaianCedi,'pos': 'before','value': 'GHS'},
            {'name': currencyDetail.Cambodianriel,'pos': 'before','value': 'Riel'},
            {'name': currencyDetail.CzechKoruna,'pos': 'after','value': 'K?'},
            {'name': currencyDetail.ZimbabweDollar,'pos': 'before','value': '$'},
            {'name': currencyDetail.QatariRiyal,'pos': 'before','value': 'Rial'},
            {'name': currencyDetail.CaymanIslandsDollar,'pos': 'before','value': '$'},
            {'name': currencyDetail.Comorianfranc,'pos': 'before','value': 'CF'},
            {'name': currencyDetail.KuwaitiDinar,'pos': 'before','value': 'din'},
            {'name': currencyDetail.CroatianKuna,'pos': 'before','value': 'kn'},
            {'name': currencyDetail.KenyanShilling,'pos': 'before','value': 'Ksh'},
            {'name': currencyDetail.LesothoLoti,'pos': 'before','value': 'LSL'},
            {'name': currencyDetail.LaoKip,'pos': 'before','value': '?'},
            {'name': currencyDetail.LebanesePound,'pos': 'before','value': 'L￡'},
            {'name': currencyDetail.Lithuanianlitas,'pos': 'before','value': 'Lt'},
            {'name': currencyDetail.LibyanDinar,'pos': 'before','value': 'din'},
            {'name': currencyDetail.LiberianDollar,'pos': 'before','value': '$'},
            {'name': currencyDetail.RwandaFranc,'pos': 'before','value': 'RF'},
            {'name': currencyDetail.RomanianLeu,'pos': 'before','value': 'RON'},
            {'name': currencyDetail.MalagasyAriary,'pos': 'before','value': 'Ar'},
            {'name': currencyDetail.MaldivianRufiyaa,'pos': 'before','value': 'Rf'},
            {'name': currencyDetail.MalawiKwacha,'pos': 'before','value': 'MWK'},
            {'name': currencyDetail.MalaysianRinggit,'pos': 'before','value': 'RM'},
            {'name': currencyDetail.MacedoniawearingDinar,'pos': 'before','value': 'din'},
            {'name': currencyDetail.MauritiusRupee,'pos': 'before','value': 'MURs'},
            {'name': currencyDetail.MauritanianOuguiya,'pos': 'before','value': 'MRO'},
            {'name': currencyDetail.MongolianTugrik,'pos': 'before','value': '?'},
            {'name': currencyDetail.BangladeshiTaka,'pos': 'before','value': '?'},
            {'name': currencyDetail.PeruvianNuevoSol,'pos': 'before','value': 'S/'},
            {'name': currencyDetail.MyanmarKyat,'pos': 'before','value': 'K'},
            {'name': currencyDetail.MoldovanLeu,'pos': 'before','value': 'MDL'},
            {'name': currencyDetail.MoroccanDirham,'pos': 'before','value': 'dh'},
            {'name': currencyDetail.MozambiqueMetical,'pos': 'before','value': 'MTn'},
            {'name': currencyDetail.MexicanPeso,'pos': 'before','value': '$'},
            {'name': currencyDetail.NamibianDollar,'pos': 'before','value': '$'},
            {'name': currencyDetail.SouthAfricanRand,'pos': 'before','value': 'R'},
            {'name': currencyDetail.SouthSudanesePound,'pos': 'before','value': '￡'},
            {'name': currencyDetail.NicaraguaCordoba,'pos': 'before','value': 'C$'},
            {'name': currencyDetail.NepaleseRupee,'pos': 'before','value': 'Rs'},
            {'name': currencyDetail.NigerianNaira,'pos': 'before','value': '?'},
            {'name': currencyDetail.NorwegianKrone,'pos': 'after','value': 'kr'},
            {'name': currencyDetail.GeorgianLari,'pos': 'before','value': 'GEL'},
            {'name': currencyDetail.RenminbiOffshore,'pos': 'before','value': '￥'},
            {'name': currencyDetail.SwedishKrona,'pos': 'after','value': 'kr'},
            {'name': currencyDetail.SwissFranc,'pos': 'before','value': 'CHF'},
            {'name': currencyDetail.SerbianDinar,'pos': 'before','value': 'din'},
            {'name': currencyDetail.SierraLeone,'pos': 'before','value': 'SLL'},
            {'name': currencyDetail.SeychellesRupee,'pos': 'before','value': 'SCR'},
            {'name': currencyDetail.SaudiRiyal,'pos': 'before','value': 'Rial'},
            {'name': currencyDetail.SaoTomeDobra,'pos': 'before','value': 'Db'},
            {'name': currencyDetail.SaintHelenapound,'pos': 'before','value': '￡'},
            {'name': currencyDetail.SriLankaRupee,'pos': 'before','value': 'Rs'},
            {'name': currencyDetail.SwazilandLilangeni,'pos': 'before','value': 'SZL'},
            {'name': currencyDetail.SudanesePound,'pos': 'before','value': 'SDG'},
            {'name': currencyDetail.Surinamesedollar,'pos': 'before','value': '$'},
            {'name': currencyDetail.SolomonIslandsDollar,'pos': 'before','value': '$'},
            {'name': currencyDetail.SomaliShilling,'pos': 'before','value': 'SOS'},
            {'name': currencyDetail.TajikistanSomoni,'pos': 'before','value': 'Som'},
            {'name': currencyDetail.PacificFranc,'pos': 'after','value': 'FCFP'},
            {'name': currencyDetail.ThaiBaht,'pos': 'before','value': '?'},
            {'name': currencyDetail.TanzanianShilling,'pos': 'before','value': 'TSh'},
            {'name': currencyDetail.TonganPaanga,'pos': 'before','value': 'T$'},
            {'name': currencyDetail.TrinidadandTobagoDollar,'pos': 'before','value': '$'},
            {'name': currencyDetail.TunisianDinar,'pos': 'before','value': 'din'},
            {'name': currencyDetail.TurkishLira,'pos': 'before','value': '?'},
            {'name': currencyDetail.VanuatuVatu,'pos': 'before','value': 'VUV'},
            {'name': currencyDetail.GuatemalanQuetzal,'pos': 'before','value': 'Q'},
            {'name': currencyDetail.CommissionBolivar,'pos': 'before','value': 'Bs'},
            {'name': currencyDetail.BruneiDollar,'pos': 'before','value': '$'},
            {'name': currencyDetail.UgandanShilling,'pos': 'before','value': 'UGX'},
            {'name': currencyDetail.UkrainianHryvnia,'pos': 'before','value': 'грн.'},
            {'name': currencyDetail.UruguayanPeso,'pos': 'before','value': '$'},
            {'name': currencyDetail.Uzbekistansom,'pos': 'before','value': 'so?m'},
            {'name': currencyDetail.WesternSamoaTala,'pos': 'before','value': 'WST'},
            {'name': currencyDetail.SingaporeDollar,'pos': 'before','value': '$'},
            {'name': currencyDetail.NT,'pos': 'before','value': 'NT$'},
            {'name': currencyDetail.NewZealandDollar,'pos': 'before','value': '$'},
            {'name': currencyDetail.HungarianForint,'pos': 'before','value': 'Ft'},
            {'name': currencyDetail.SyrianPound,'pos': 'before','value': '￡'},
            {'name': currencyDetail.JamaicanDollar,'pos': 'before','value': '$'},
            {'name': currencyDetail.ArmenianDram,'pos': 'before','value': 'Dram'},
            {'name': currencyDetail.YemeniRial,'pos': 'before','value': 'Rial'},
            {'name': currencyDetail.IraqiDinar,'pos': 'before','value': 'din'},
            {'name': currencyDetail.IranianRial,'pos': 'before','value': 'Rial'},
            {'name': currencyDetail.NewIsraeliShekel,'pos': 'before','value': '?'},
            {'name': currencyDetail.IndianRupee,'pos': 'before','value': '?'},
            {'name': currencyDetail.IndonesianRupiah,'pos': 'before','value': 'Rp'},
            {'name': currencyDetail.JordanianDinar,'pos': 'before','value': 'din'},
            {'name': currencyDetail.VND,'pos': 'after','value': '?'},
            {'name': currencyDetail.ZambianKwacha,'pos': 'before','value': 'ZMW'},
            {'name': currencyDetail.GibraltarPound,'pos': 'before','value': '￡'},
            {'name': currencyDetail.ChileanPeso,'pos': 'before','value': '$'},
            {'name': currencyDetail.CFAFrancBEAC,'pos': 'before','value': 'FCFA'}
        ];

        this.dateFmtList = locale().dateFmtList;

        this.numFmtList = [
            {
                "name": "1235",
                "value": "0"
            },
            {
                "name": "1234.56",
                "value": "0.00"
            },
            {
                "name": "1,235",
                "value": "#,##0"
            },
            {
                "name": "1,234.56",
                "value": "#,##0.00"
            },
            {
                "name": "1,235",
                "value": "#,##0_);(#,##0)"
            },
            {
                "name": "1,235",
                "value": "#,##0_);[Red](#,##0)"
            },
            {
                "name": "1,234.56",
                "value": "#,##0.00_);(#,##0.00)"
            },
            {
                "name": "1,234.56",
                "value": "#,##0.00_);[Red](#,##0.00)"
            },
            {
                "name": "$1,235",
                "value": "$#,##0_);($#,##0)"
            },
            {
                "name": "$1,235",
                "value": "$#,##0_);[Red]($#,##0)"
            },
            {
                "name": "$1,234.56",
                "value": "$#,##0.00_);($#,##0.00)"
            },
            {
                "name": "$1,234.56",
                "value": "$#,##0.00_);[Red]($#,##0.00)"
            },
            {
                "name": "1234.56",
                "value": "@"
            },
            {
                "name": "123456%",
                "value": "0%"
            },
            {
                "name": "123456.00%",
                "value": "0.00%"
            },
            {
                "name": "1.23E+03",
                "value": "0.00E+00"
            },
            {
                "name": "1.2E+3",
                "value": "##0.0E+0"
            },
            {
                "name": "1234 5/9",
                "value": "# ?/?"
            },
            {
                "name": "1234 14/25",
                "value": "# ??/??"
            },
            {
                "name": "$ 1,235",
                "value": '_($* #,##0_);_(...($* "-"_);_(@_)'
            },
            {
                "name": "1,235",
                "value": '_(* #,##0_);_(*..._(* "-"_);_(@_)'
            },
            {
                "name": "$ 1,234.56",
                // "value": '_($* #,##0.00_)...* "-"??_);_(@_)'
                "value": '_($* #,##0.00_);_(...($* "-"_);_(@_)'
            },
            {
                "name": "1,234.56",
                "value": '_(* #,##0.00_);...* "-"??_);_(@_)'
            },
        ]

        showModalMask();
        let _elMoreFmtDialog = document.getElementById("luckysheet-moreFormat-dialog");
        if (_elMoreFmtDialog) _elMoreFmtDialog.remove();

        let title = "", content = '';

        if(type == "morecurrency"){ //货币
            title = locale_format.titleCurrency;

            let listHtml = '';

            for(let i = 0; i < _this.moneyFmtList.length; i++){
                let name = _this.moneyFmtList[i]["name"];
                let pos = _this.moneyFmtList[i]["pos"];
                let value = _this.moneyFmtList[i]["value"];

                listHtml += '<div class="listItem">'+
                                '<div class="name">'+ name +'</div>'+
                                '<div class="value">'+ value +'</div>'+
                                '<input type="hidden" value="'+ pos +'"/>'+
                            '</div>';
            }

            content = '<div class="box" id="morecurrency">'+
                        '<div class="decimal">'+
                            '<label>'+ locale_format.decimalPlaces +'：</label>'+
                            '<input type="number" class="formulaInputFocus" value="2" min="0" max="9"/>'+
                        '</div>'+
                        '<div class="listbox">'+ listHtml +'</div>'+
                      '</div>';
        }
        else if(type == "moredatetime"){ //日期时间
            title = locale_format.titleDateTime;

            let listHtml = '';

            for(let i = 0; i < _this.dateFmtList.length; i++){
                let name = _this.dateFmtList[i]["name"];
                let value = _this.dateFmtList[i]["value"];

                listHtml += '<div class="listItem">'+
                                '<div class="name">'+ name +'</div>'+
                                '<div class="value">'+ value +'</div>'+
                            '</div>';
            }

            content = '<div class="box" id="moredatetime">'+
                        '<div class="listbox">'+ listHtml +'</div>'+
                      '</div>';
        }
        else if(type == "moredigit"){ //数字
            title = locale_format.titleNumber;

            let listHtml = '';

            for(let i = 0; i < _this.numFmtList.length; i++){
                let name = _this.numFmtList[i]["name"];
                let value = _this.numFmtList[i]["value"];

                listHtml += '<div class="listItem">'+
                                '<div class="name">'+ name +'</div>'+
                                '<div class="value">'+ value +'</div>'+
                            '</div>';
            }

            content = '<div class="box" id="moredigit">'+
                        '<div class="listbox">'+ listHtml +'</div>'+
                      '</div>';
        }

        document.body.insertAdjacentHTML('beforeend', replaceHtml(modelHTML, { 
            "id": "luckysheet-moreFormat-dialog", 
            "addclass": "luckysheet-moreFormat-dialog", 
            "title": title, 
            "content": content, 
            "botton": '<button id="luckysheet-moreFormat-dialog-confirm" class="btn btn-primary">'+ locale_button.confirm +'</button><button class="btn btn-default luckysheet-model-close-btn">'+ locale_button.cancel +'</button>', 
            "style": "z-index:100003" 
        }));
        let _elMoreFmtDialog2 = document.getElementById("luckysheet-moreFormat-dialog");
        let _elDialogContent = _elMoreFmtDialog2?.querySelector(".luckysheet-modal-dialog-content");
        if (_elDialogContent) _elDialogContent.style.minWidth = "400px";
        let myh = _elMoreFmtDialog2?.offsetHeight,
            myw = _elMoreFmtDialog2?.offsetWidth;
        let winw = document.documentElement.clientWidth, winh = document.documentElement.clientHeight;
        let scrollLeft = document.documentElement.scrollLeft, scrollTop = document.documentElement.scrollTop;
        if (_elMoreFmtDialog2) Object.assign(_elMoreFmtDialog2.style, {
            "left": ((winw + scrollLeft - myw) / 2) + "px",
            "top": ((winh + scrollTop - myh) / 3) + "px"
        });
        if (_elMoreFmtDialog2) _elMoreFmtDialog2.style.display = 'block';
        
        let _elFirstItem = document.querySelector("#luckysheet-moreFormat-dialog .listbox .listItem");
        if (_elFirstItem) _elFirstItem.classList.add("on");
    },
    init: function(){
        let _this = this;

        //选择格式
        document.addEventListener("click", function(e) { const t = e.target?.closest?.("#luckysheet-moreFormat-dialog .listbox .listItem"); if (t && document.contains(t)) {
            t.classList.add("on");
            Array.from(t.parentElement.children).filter(s => s !== t).forEach(function(el) { el.classList.remove("on"); });
        } });

        //确定
        offNS("moreFormatConfirm");
        onNS(document, "click.moreFormatConfirm", "#luckysheet-moreFormat-dialog #luckysheet-moreFormat-dialog-confirm", function(){
            const _elMoreFmt = document.getElementById("luckysheet-moreFormat-dialog"); if (_elMoreFmt) _elMoreFmt.style.display = 'none';
            hideModalMask();

            let d = editor.deepCopyFlowData(Store.sheetData);

            let _elValueEl = document.querySelector("#luckysheet-moreFormat-dialog .listbox .listItem.on .value");
            let value = _elValueEl ? _elValueEl.textContent : "";
            let _elBox = document.querySelector("#luckysheet-moreFormat-dialog .box");
            let id = _elBox ? _elBox.id : "";

            if(id == "morecurrency"){ //货币
                if(value.indexOf("?") != -1){
                    return;
                }

                let decimal = parseInt(document.querySelector("#luckysheet-moreFormat-dialog .decimal input")?.value?.trim());

                if(decimal.toString() == "NaN" || decimal < 0 || decimal > 9){
                    if(isEditMode()){
                        alert("小数位数必须在0-9之间！");
                    }   
                    else{
                        tooltip.info("小数位数必须在0-9之间！", "");
                    }

                    return;
                }

                let str = "";

                if(decimal > 0){
                    for(let i = 1; i <= decimal; i++){
                        str += "0";
                    }

                    str = "0." + str;
                }
                else{
                    str = "#";
                }

                let _elHiddenInput = document.querySelector("#luckysheet-moreFormat-dialog .listbox .listItem.on input[type='hidden']");
                let pos = _elHiddenInput ? _elHiddenInput.value : "";

                if(pos == "before"){
                    str = '"' + value + '" ' + str;
                }
                else if(pos == "after"){
                    str = str + ' "' + value + '"';
                }

                menuButton.updateFormat(d, "ct", str);
            }
            else if(id == "moredatetime"){ //日期时间
                menuButton.updateFormat(d, "ct", value);
            }
            else if(id == "moredigit"){ //数字
                menuButton.updateFormat(d, "ct", value);
            }
        })
    }
}

export default luckysheetMoreFormat;
