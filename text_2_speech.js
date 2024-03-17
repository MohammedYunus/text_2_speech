// ==UserScript==
// @name         Nexus
// @namespace    http://tampermonkey.net/
// @version      6
// @description  popup's, speech and voice commands.
// @require      https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js
// @require      https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/bootbox.js/5.5.2/bootbox.min.js
// @include      https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css
// @require      https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_getResourceURL
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValues
// @grant        GM_sendMessage
// @grant        GM_addValueChangeListener
// @author       Mohammed yunus
// @match        https://zircon-eu.aka.amazon.com/*
// @match        https://zircon-fe.aka.amazon.com/*
// @match        https://zircon-na.aka.amazon.com/*
// ==/UserScript==

/*globals angular $ bootbox html2canvas Papa*/

(function () {

    var count;
    var currentPage = location.href;
    var previousPage;

    var attr;
    var attr_exc;
    var mkpl_code;

    Nexus();

    function Nexus() {
        if ((location.href.includes("https://zircon-na.aka.amazon.com/")) || (location.href.includes("https://zircon-eu.aka.amazon.com/")) || (location.href.includes("https://zircon-fe.aka.amazon.com/"))) {
            console.log('zircon site');

            if (location.href.includes("/audit/workitem")) {
                console.log('current url 1:', location.href);
                currentPage = location.href;
                workItemMainPage();
            }
            if (location.href.includes("/audit/assigned")) {
                console.log('current url 1:', location.href);
                currentPage = location.href;
                while(!!document.querySelector(`.toast`)){document.querySelector(`.toast`).remove()}
            }
            setInterval(function () {
                if (currentPage != location.href) {
                    previousPage = currentPage;
                    console.log('url changed...from nexus');
                    currentPage = location.href;
                    if (location.href.includes("/audit/assigned")) {
                        location.reload();
                        try {
                            if (count > 5) {
                                location.reload();
                            }
                            attr = null;
                            attr_exc = null;
                            mkpl_code = '';
                            count++;
                        }
                        catch (e) {
                            console.log('assigned page reloading error', e)
                        }
                    }
                    if (location.href.includes("/audit/workitem") && !previousPage.includes("/audit/workitem")) {
                        try {
                            workItemMainPage();
                        }
                        catch (err) {
                            console.log('execution failed at work item page');
                        }
                    }
                }
            }, 1000);
        }
    }

    function workItemMainPage() {
        let pageload_check = () => {
            return new Promise((resolve, reject) => {
                try {
                    let i = setInterval(() => {
                        try {
                            attr = angular.element(document.querySelector('.attrs')).scope().workItemController.workItemMap
                        }
                        catch (e) {
                            console.log('not yet loaded');
                        }
                        if (attr) {
                            clearInterval(i);
                            resolve('Load complete');
                        }

                    }, 500);
                }
                catch (e) {
                    reject('Load failed');
                }
            });
        };

        pageload_check().then(response => {
            checkTime();
            popWars();
            popupAcknowledgement();// merged high_rebate_popup and negativePVAlert_aleart and bundle_detector
            asinwise_exceptions();
            Top_brand_baby_identifier();
            silver_surfer_identifier();
            glwise_exceptions();
            competitorwise_popup();
            listenZircon();
            iSamplerBased_popup();
            detectGender();
            noniden();
        });
    }

    //================================================================================================================================

    function asinwise_exceptions() {
        try {
            let asin = attr.asin;
            let competitor = attr.CompetitorName;
            let parsed_data = exceptions_parsed_data;
            for (let entry of parsed_data) {
                if ((entry.asin != "") && (asin.includes(entry.asin))) {
                    bootbox.alert('<b>' + entry.msg + '</b>');
                    break;
                }
                if ((entry.asin != "") && (asin.includes(entry.asin)) && (competitor.includes(entry.Competitor))) {
                    bootbox.alert('<b>' + entry.msg + '</b>');
                    break;
                }
            }
        }
        catch (e) {
            console.log("error at used_book section:", e);
        }
    }

    //================================================================================================================================
    function Top_brand_baby_identifier(){
        try{
            //alert("This is the default alert!");
            let display="Alert!! Size has to be in same age group, refer exception in Size-Tab";
            let top_brand= angular.element(document.querySelector('.attrs')).scope().workItemController.workItem?.sampleId
            let tb_check=top_brand.includes("_Top_Brand_Audit")
            let tb_cat=angular.element(document.querySelector('.attrs')).scope().workItemController.workItem.workItemAttributes.workItemAttributesMap?.Cat
            if (tb_check && tb_cat.includes("30906000")){
                bootbox.alert('<b>' + display + '</b>');
            }
        }

        catch (e) {
            console.log("error in gl function ..", e);
        }
    }

    //================================================================================================================================

    function silver_surfer_identifier(){
        try{
            //alert("This is the default alert!");
            let display="Be alert!!! It's a SilverSurfer listing, i.e silversurfer_mapper_id=Mapper error and silversurfer_afmid=AFM Error";
            attr_exc = angular.element(document.querySelector('.attrs')).scope().workItemController.exactMapping
            let mapping_str = attr_exc.otherAttributes.mapperName
            let end_indx = mapping_str.indexOf("@amazon");
            let mapper_id = mapping_str.slice(0, end_indx);
            console.log("mapper_id_match_condition",mapper_id.match(/SilverSurfer/)!==null)
            if (mapper_id.match(/SilverSurfer/)!==null){
                bootbox.alert('<b>' + display + '</b>');
            }
        }

        catch (e) {
            console.log("error in gl function ..", e);
        }
    }

    //================================================================================================================================

    function glwise_exceptions(){
        try {
            mkpl_code = attr.Marketplace;
            let gl=attr.Gl;
            let price_var=attr.normalized_price_variance;
            let display="This is a high visibility ASIN, Ensure the mapping and PARS are correct";
            if ((mkpl_code=="1") && (price_var<-0.35) && ((gl=="gl_camera") || (gl=="gl_wireless"))) {
                bootbox.alert('<b>' + display + '</b>');
            }
        }
        catch (e) {
            console.log("error in gl function ..", e);
        }
    }

    //================================================================================================================================

    function competitorwise_popup(){
        try {
            let competitor = attr.CompetitorName;
            let parsed_data = competitorwise_parsed_data;

            for (let entry of parsed_data) {
                if (entry.competitor == competitor) {
                    let popLoc=entry.popupLocation;
                    if(popLoc.length === 0) {
                        bootbox.alert('<b>' + entry.display + '</b>');
                        break;
                    }
                }
            }
            document.addEventListener('change',competitorwise_popup2);
        }
        catch (e) {
            console.log("error in competitorwise_popup function ..", e);
        }
    }
    let competitorwise_popup2 = ()=>{
        let competitor = attr.CompetitorName;
        let parsed_data = competitorwise_parsed_data;
        for (let entry of parsed_data){
            if (entry.competitor == competitor) {
                let popLoc=entry.popupLocation;
                const regEx = new RegExp(popLoc);
                if(popLoc.length != 0) {
                    if(getParentNode(event.target,6).querySelector('.panel-title').innerText.match(regEx)){
                        bootbox.alert('<b>' + entry.display + '</b>');
                    }
                }
            }
        }
    }
    function getParentNode(element, level=1) {
        while(level-- > 0) {
            element = element.parentNode;
            if(!element) {
                return null;
            }
        }
        return element;
    }

    //================================================================================================================================

    function iSamplerBased_popup(){
        try {
            let iSamplerScore = Number(attr.i_sampler_score).toFixed(2);
            let samplingRuleName = angular.element(document.querySelector('.attrs')).scope().workItemController.workItem.samplingAttributes.samplingAttributesMap.SamplingRuleName;
            let priceVariance = Number(attr.normalized_price_variance).toFixed(2);
            let display="This is a highly suspicious listing suggested by ML models. Please audit carefully.";
            let auditorName = angular.element(document.querySelector('.attrs')).scope().workItemController.workItem.auditor;
            let noErrBtn = document.querySelectorAll(`[ng-true-value="'No error'"]`);
            let errBtn = document.querySelectorAll(`[ng-true-value="'Error'"]`);
            let allBtn = document.querySelectorAll('.btn.btn-primary');
            let checker = document.querySelector('[ng-model="workItemController.workItem.auditResult"]');
            let ackBtn = document.querySelector('#ackCls');
            let comment_field = document.querySelector('#comment');

            function disableSubmitBtn(state, color){
                allBtn.forEach((cur)=>{
                    if(cur.innerText === 'Submit'){
                        cur.disabled = state;
                        cur.setAttribute('class', color);
                    }
                });
            }

            if(checker.checked === true){
                disableSubmitBtn(false,'btn btn-primary');
            }

            if ((samplingRuleName === 'positive Isampler_score') || ((iSamplerScore > 0.6) && (priceVariance < -0.5))) { //

                comment_field.required = true;
                comment_field.placeholder = "Please acknowledge all Pop-Up's for this listing.";

                //1. cases where bad price exist and error button is enabled.
                if(checker.checked === true){
                    disableSubmitBtn(false,'btn btn-primary');
                }else{
                    disableSubmitBtn(true,'btn btn-dark');
                }

                //2. when any error btn is clicked.
                errBtn.forEach((cur, i)=>{
                    cur.addEventListener('click',()=>{
                        disableSubmitBtn(false,'btn btn-primary');
                    });
                });

                //3. reverting back to no-error button.
                noErrBtn.forEach((cur, i)=>{
                    cur.addEventListener('click',()=>{
                        if(i === (noErrBtn.length - 1)){
                            disableSubmitBtn(false,'btn btn-primary');
                        }else{
                            disableSubmitBtn(true,'btn btn-dark');
                        }
                    });
                });

                //4. when checker is clicked
                checker.addEventListener('click',()=>{
                    if(checker.checked){
                        disableSubmitBtn(false,'btn btn-primary');
                    }else if(!checker.checked && comment_field.value.includes('acknowledged')){
                        disableSubmitBtn(false,'btn btn-primary');
                    }else{
                        disableSubmitBtn(true,'btn btn-dark');
                    }
                });

                ackBtn.addEventListener('click',()=>{
                    //console.log('clicked');
                    disableSubmitBtn(false,'btn btn-primary');
                    comment_field.value = `All pop-up's were acknowledged for this listing by ${auditorName}.`;
                    comment_field.dispatchEvent(new Event('change'));
                    comment_field.dispatchEvent(new Event('input'));
                });


                bootbox.alert('<b>' + display + ' I_SAMPLER_SCORE = ' +iSamplerScore+ ' NormalizedPriceVariance = ' +priceVariance+'</b>');

            }
        }
        catch (e) {
            console.log("error in iSamplerBased_popup function ..", e);
        }
    }

    //popWars_aleart==================================================================================================================

    let popWars = function(){
        let iSamplerScore = Number(attr.i_sampler_score).toFixed(2);
        let samplingRuleName = angular.element(document.querySelector('.attrs')).scope().workItemController.workItem.samplingAttributes.samplingAttributesMap.SamplingRuleName;
        let matchingType = attr.MatchingType?.toLowerCase();
        let unmatchedAttributes = attr.UnmatchedAttributes?.toLowerCase();
        let newSampleAttribute = attr.UnmatchedAttributes?.split(',')[0]?.split('{')[2]?.split(':')[1]?.split('"')[1]?.toLowerCase();
        let bundleCheck = attr?.Bundle;
        let priceVariance=attr?.normalized_price_variance;
        let rebatePercentage = attr?.rebate_percentage;
        let noErrBtn = document.querySelectorAll(`[ng-true-value="'No error'"]`);
        let errBtn = document.querySelectorAll(`[ng-true-value="'Error'"]`);

        let popupModal = `
        <!-- Modal -->
        <div class="modal fade" id="popIden1" role="dialog" style="top:20%;bottom:0%;left:15%;" data-keyboard="false" data-backdrop="static">
          <div class="modal-dialog" style="width:80%;">
           <div class="modal-content">
             <div class="modal-header">
              <h3 class="modal-title text-center" id="exampleModalLongTitle" >Mapping Alert</h3>
             </div>
          <div class="modal-body">
        <p id="errorEnc">This is a <b style="color:red">highly suspicious listing</b> suggested by ML models. Please check the listing again if required and audit carefully.<div><b style="padding-top:0.5em;">I_SAMPLER_SCORE = ${iSamplerScore}</b></div>
        <br><b style="padding-top:0.5em;">Normalized_Price_Variance = ${priceVariance}</b></p>
          </div>
          <div class="modal-footer" style="padding:0.5em;" >
           <button type="button" data-dismiss="modalV3" aria-label="Close" id="ackCls" class="btn btn-success btn-lg">Acknowledge</button>
         </div>
        </div>
       </div>
      </div>
        `;

        let popModal2 = `<!-- Modal -->
        <div class="modal fade" id="popIden2" role="dialog" style="top:1%;left:5%;" data-keyboard="false" data-backdrop="static">
          <div class="modal-dialog" style="width:90%;">
           <div class="modal-content">
             <div class="modal-header">
              <h3 class="modal-title text-center" id="exampleModalLongTitle" style="height:3%;">High Price Variance</h3>
             </div>
          <div class="modal-body" style="height:75%;">
        <p><b>
        <span style="font-size: 12px;">This listing has high price variance. Follow below steps to check if competitor has pricing error.</br></br>
        Step 1: Check if competitor is giving price along with "per unit", "/Oz", "/lb", "/ea" price. If yes then</br>
        Step 2: Calculate the "Total Product price" with per Oz price.</br>
        Step 3: If the competitor's "Total Product Price" is more than +/- 20% with Walmart price then mark the listing as:</br></br>
        <span style="color:red">Competitor Catalog Issue > Wrong Price and mention the "Total Product price: xx" in the comment.</span></br></br>
        Example: <a href="https://www.walmart.com/ip/Fancy-Feast-Grain-Free-Pate-Wet-Cat-Food-Tender-Beef-Chicken-Feast-3-oz-Can/10534975">link</a></br></br>
        1. Walmart price is 0.88, per oz price is 1.2 Cents which is 0.012 dollars.</br>
        2.  "Total Product price" = 3 oz * 0.012 = 0.036.</br>
        3. Walmart price is 0.88 and "Total Product Price" is 0.036 which is more than 20%.</br></br>
        Hence mark the listing as Competitor Catalog Issue > Wrong Price and mention the "Total Product price: 0.036" in the comment.</span>
        </b></p>
          </div>
          <div class="modal-footer" style="padding:0.5em;" >
           <button type="button" data-dismiss="modalV3" aria-label="Close" id="ackCls" class="btn btn-success btn-lg">Acknowledge</button>
         </div>
        </div>
       </div>
      </div>`

        let afterModal1 = document.querySelector('body');
        afterModal1.insertAdjacentHTML("beforeend", popupModal);
        afterModal1.insertAdjacentHTML("beforeend", popModal2);

        let popHTML = `
          <ul class="notifications"></ul>
        `;
        //<ul class="acknowledge"></ul>
        document.body.insertAdjacentHTML("afterBegin",popHTML);

        let head = document.head;
        let styling = `
                 <style id="alertStyle">
                      :root {
                        --dark: #34495E;
                        --light: #ffffff;
                        --success: #0ABF30;
                        --error: #E24D4C;
                        --warning: #E9BD0C;
                        --info: #3498DB;
                      }

                      .notifications {
                        position: fixed;
                        top: 30px;
                        right: 20px;
                        z-index: 7;
                      }
                      .notifications :where(.toast, .column) {
                        display: flex;
                        align-items: center;
                      }
                      .notifications .toast {
                        width: 600px;
                        position: relative;
                        overflow: hidden;
                        list-style: none;
                        border-radius: 4px;
                        padding: 16px 17px;
                        margin-bottom: 10px;
                        background: rgb(120, 221, 255);
                        justify-content: space-between;
                        border:1px solid black;
                        animation: show_toast 0.3s ease forwards;
                      }
                      @keyframes show_toast {
                        0% {
                          transform: translateX(100%);
                        }
                        40% {
                          transform: translateX(-5%);
                        }
                        80% {
                          transform: translateX(0%);
                        }
                        100% {
                          transform: translateX(-10px);
                        }
                      }
                      .notifications .toast.hide {
                        animation: hide_toast 0.7s ease forwards;
                      }
                      @keyframes hide_toast {
                        0% {
                          transform: translateX(-10px);
                        }
                        40% {
                          transform: translateX(0%);
                        }
                        80% {
                          transform: translateX(-5%);
                        }
                        100% {
                          transform: translateX(calc(100% + 20px));
                        }
                      }
                      .toast::before {
                        position: absolute;
                        content: "";
                        height: 3px;
                        width: 100%;
                        bottom: 0px;
                        left: 0px;
                        animation: progress 10.1s linear forwards;
                      }
                      @keyframes progress {
                        100% {
                          width: 0%;
                        }
                      }
                     .toast .column span {
                        font-size: 15px;
                        margin-left: 12px;
                      }

                      .toast.error::before{
                         background: var(--dark);
                       }
                       .toast.warning::before{
                         background: var(--dark);
                       }
                       .toast.info::before{
                         background: var(--dark);
                       }

                      @media screen and (max-width: 530px) {
                        .notifications  {
                          width: 75%;
                        }
                        .notifications .toast {
                          width: 100%;
                          font-size: 1rem;
                          margin-left: 20px;
                        }
                      }
                </style>`;

        head.insertAdjacentHTML("beforeend",styling);
        const notifications = document.querySelector(".notifications");

        let brandAttributeValues = function(){
            if((unmatchedAttributes?.includes('color')) && (unmatchedAttributes?.includes('brand'))){
                return "Brand and color";
            }else if(unmatchedAttributes?.includes('brand')){
                return "Brand";
            }
        }

        let colorAttributeValues = function(){
            if((unmatchedAttributes?.includes('color')) && (unmatchedAttributes?.includes('brand'))){
                return "Brand and color";
            }else if(unmatchedAttributes?.includes('color')){
                return "Color";
            }
        }
        //console.log(brandAttributeValues());

        const toastDetails = {
            timer: 10100,

            title_Info: {
                icon: '&#xf071;',
                text: 'BUNDLE ALERT!!! \n Amazon is selling Bundle product, ensure to validate if competitor is also selling the same.',
                type: 'warning',
                color: "#f9c720"
            },

            brand_Info: {
                icon: '&#xf05a;',
                text: `${brandAttributeValues()} can be mismatched.`,
                type: 'info',
                color: "rgb(120, 221, 255)"
            },

            color_Info: {
                icon: '&#xf05a;',
                text: `${colorAttributeValues()} can be mismatched.`,
                type: 'info',
                color: "#90EE90"
            },

            title_Info_PV: {
                icon: '&#xf071;',
                text: 'This listing has high negative PV, ensure to take accurate decision.',
                type: 'warning',
                color: "#FF5C5C"
            },

            title_Info_HighRebate: {
                icon: '&#xf071;',
                text: 'This listing has high rebate ( greater than 30% of the competitor price ), ensure the rebate values are validated correctly.',
                type: 'warning',
                color: "#FF5C5C"
            },

            other_unmatched_info: {
                icon: '&#xf05a;',
                text: `${newSampleAttribute} can be mismatched.`,
                type: 'info',
                color: "#DA70D6"
            }
        }
        //<i class="fa-sharp fa-solid fa-triangle-exclamation"></i>

        const removeToast = (toast) => {
            toast.classList.add("hide");
            if(toast.timeoutId) clearTimeout(toast.timeoutId); // Clearing the timeout for the toast
            setTimeout(() => toast.remove(), 1000); // Removing the toast after 1000ms
        }

        const createToast = (id) => {
            // Getting the icon and text for the toast based on the id passed
            const { icon, text } = toastDetails[id];
            const toast = document.createElement("li"); // Creating a new 'li' element for the toast.
            toast.className = `toast ${toastDetails[id].type}`; // Setting the classes for the toast.
            toast.style = `background:${toastDetails[id].color}`;
            // Setting the inner HTML for the toast
            toast.innerHTML = `<div class="column">
                         <i class="fa" style="font-size:25px; color:White;">${icon}</i>
                         <span>${text}</span>
                      </div>`;
            notifications.appendChild(toast); // Append the toast to the notification ul
            // Setting a timeout to remove the toast after the specified duration
            toast.timeoutId = setTimeout(() => removeToast(toast), toastDetails.timer);
        }

        function textToSpeech(text){
            const voices = speechSynthesis.getVoices();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            voices.forEach(cur=>{
                if(cur.name === 'Google हिन्दी'){
                    utterance.voice = cur;
                }
            });
            speechSynthesis.speak(utterance);
        }

        let toastPopUp = function(tab_id, type){
            let toast_warning = document.querySelector(`.toast.${type}`);
            if(toast_warning){
                toast_warning.remove();
                createToast(tab_id);
            }else{
                createToast(tab_id);
            }
        }

        let allPanels = document.querySelectorAll('.panel-heading');
        allPanels.forEach((cur, i)=>{

            if(cur.innerText.includes('Brand')){
                let PrevNoErr = noErrBtn[i-1];
                let PrevErr = errBtn[i-1];
                console.log(allPanels[i]);
                let brandTab = allPanels[i];
                let isOpen = allPanels[i].parentElement;
                brandTab.id = "brand_Info";
                let brandClickElements = [PrevNoErr, PrevErr, brandTab];

                brandClickElements.forEach(cur=>{
                    cur.addEventListener('click',()=>{
                        if(matchingType==="inexact" && isOpen.className.includes('open') && (unmatchedAttributes?.includes('brand'))){
                            toastPopUp(brandTab.id, toastDetails.brand_Info.type);
                            textToSpeech(toastDetails.brand_Info.text);
                        }
                    });
                });
            }

            if(cur.innerText.includes('Color')){
                let PrevNoErr = noErrBtn[i-1];
                let PrevErr = errBtn[i-1];
                let colorTab = allPanels[i];
                let isOpen = allPanels[i].parentElement;
                colorTab.id = "color_Info";
                let colorClickElements = [PrevNoErr, PrevErr, colorTab];
                colorClickElements.forEach(cur=>{
                    cur.addEventListener('click',()=>{
                        if(matchingType==="inexact" && isOpen.className.includes('open') && (unmatchedAttributes?.includes('color'))){
                            toastPopUp(colorTab.id, toastDetails.color_Info.type);
                            textToSpeech(toastDetails.color_Info.text);
                        }
                    });
                });
            }

            if ((samplingRuleName === 'positive Isampler_score') || ((iSamplerScore > 0.6) && (priceVariance < -0.5))) {
                if(cur.innerText.includes('Comp_shipping')){
                    let PrevNoErr = noErrBtn[i];
                    //let PrevErr = errBtn[i-1];
                    let bothElements = [PrevNoErr]; //error button pop-up to be enabled if required. future editor please add the 'PrevErr' attribute inside the array.
                    bothElements.forEach(cur=>{
                        cur.addEventListener('click',()=>{
                            PrevNoErr.setAttribute("data-target", "#popIden1");
                            PrevNoErr.setAttribute("data-toggle", "modalV3");
                            textToSpeech('This is a highly suspicious listing suggested by M.L. models. Please check the listing again if required and audit carefully.');
                            //PrevErr.setAttribute("data-target", "#popIden1");
                            //PrevErr.setAttribute("data-toggle", "modalV3");
                        });
                    });
                }
            }

            //High PV pet pricing error goes here.
            if(cur.innerText.includes('price')){
                let compName = attr?.CompetitorName;
                let gl = attr?.Gl;
                let pv = Number(attr.normalized_price_variance).toFixed(2);
                let prevNoerr = noErrBtn[i-1];
                let prevErr = errBtn[i-1];
                let priceElements = [prevNoerr, prevErr];
                if(compName === 'Walmart' && gl === 'gl_pet_products'){
                    priceElements.forEach(cur=>{
                        cur.addEventListener('click',()=>{
                            prevNoerr.setAttribute("data-target", "#popIden2");
                            prevNoerr.setAttribute("data-toggle", "modalV3");
                            prevErr.setAttribute("data-target", "#popIden2");
                            prevErr.setAttribute("data-toggle", "modalV3");

                        });
                    });
                }
            }

            if(cur.innerText.includes('Title')){
                console.log(allPanels[i]);
                let titleTab = allPanels[i];
                let isOpen = allPanels[i].parentElement;
                let noErrBtn = document.querySelectorAll(`[ng-true-value="'No error'"]`)[0];
                let errBtn = document.querySelectorAll(`[ng-true-value="'Error'"]`)[0];
                let click_elements = [titleTab, errBtn, noErrBtn];

                click_elements.forEach((cur)=>{
                    cur.addEventListener('click',()=>{
                        if(cur===titleTab){
                            if((bundleCheck==="VirtualBundle"||bundleCheck==="HardBundle") && isOpen.className.includes('open')){
                                toastPopUp("title_Info", toastDetails.title_Info.type);
                                textToSpeech(toastDetails.title_Info.text);
                            }
                            if((priceVariance<=-0.30) && isOpen.className.includes('open')){
                                toastPopUp("title_Info_PV", toastDetails.title_Info_PV.type);
                                textToSpeech(toastDetails.title_Info_PV.text);
                            }
                            if((rebatePercentage>=0.3) && isOpen.className.includes('open')){
                                toastPopUp("title_Info_HighRebate", toastDetails.title_Info_HighRebate.type);
                                textToSpeech(toastDetails.title_Info_HighRebate.text);
                            }
                            if(newSampleAttribute){
                                toastPopUp("other_unmatched_info", toastDetails.other_unmatched_info.type);
                                textToSpeech(toastDetails.other_unmatched_info.text);
                            }else{console.log('no unmatched attributes')}
                        }else {
                            if(bundleCheck==="VirtualBundle"||bundleCheck==="HardBundle"){
                                toastPopUp("title_Info", toastDetails.title_Info.type);
                                textToSpeech(toastDetails.title_Info.text);
                            }
                            if(priceVariance<=-0.30){
                                toastPopUp("title_Info_PV", toastDetails.title_Info_PV.type);
                                textToSpeech(toastDetails.title_Info_PV.text);
                            }
                            if(rebatePercentage>=0.3){
                                toastPopUp("title_Info_HighRebate", toastDetails.title_Info_HighRebate.type);
                                textToSpeech(toastDetails.title_Info_HighRebate.text);
                            }
                            if(newSampleAttribute){
                                toastPopUp("other_unmatched_info", toastDetails.other_unmatched_info.type);
                                textToSpeech(toastDetails.other_unmatched_info.text);
                            }else{console.log('no unmatched attributes')}
                        }
                    });
                });
            }

        });
    }

    //================================================================================================================================

    function popupAcknowledgement(){
        let priceVariance=attr.normalized_price_variance;
        let negativePVAlert_aleart_message="PV is less than -30% Have you validated if mapping is correct?";
        let rebatePercentage = attr.rebate_percentage;
        let highRebatePopupMessage="High rebate listing( greater than 30% of the competitor price ), Have you validated if mapping is correct?";
        let bundle = attr.Bundle;
        let bundleAlertMessager="Amazon is selling bundle product, Have you validated if mapping is correct?";

        try {
            let allPanels = document.querySelectorAll('.panel-heading');
            allPanels.forEach((cur, i)=>{
                if(cur.innerText.includes('Comp_price')){
                    console.log(allPanels[i]);
                    let compPrice = allPanels[i];
                    let isOpenAck = allPanels[i].parentElement;
                    let compName = attr?.CompetitorName;
                    let gl = attr?.Gl;
                    let pv = Number(attr.normalized_price_variance).toFixed(2);

                    let noErrBtnAck = document.querySelectorAll(`[ng-true-value="'No error'"]`)[0];
                    let errBtnAck = document.querySelectorAll(`[ng-true-value="'Error'"]`)[0];
                    let click_elements_Ack = [compPrice, errBtnAck, noErrBtnAck];

                    click_elements_Ack.forEach((cur)=>{
                        cur.addEventListener('click',()=>{
                            if(cur===compPrice){
                                if(priceVariance<=-0.30 && isOpenAck.className.includes('open')){
                                    bootbox.alert('<b>' + negativePVAlert_aleart_message + '</b>');
                                }
                                if(rebatePercentage>=0.3 && isOpenAck.className.includes('open')){
                                    bootbox.alert('<b>' + highRebatePopupMessage + '</b>');
                                }
                                if((bundle==="VirtualBundle"||bundle==="HardBundle") && isOpenAck.className.includes('open')){
                                    bootbox.alert('<b>' + bundleAlertMessager + '</b>');
                                }

                                if((compName === 'Walmart' && gl === 'gl_pet_products') && isOpenAck.className.includes('open')){
                                    console.log('High PV');
                                    cur.setAttribute("data-target", "#popIden2");
                                    cur.setAttribute("data-toggle", "modalV3");
                                }
                            }

                            else{
                                if(priceVariance<=-0.30){
                                    bootbox.alert('<b>' + negativePVAlert_aleart_message + '</b>');
                                }
                                if(rebatePercentage>=0.30){
                                    bootbox.alert('<b>' + highRebatePopupMessage +'</b>');
                                }
                                if(bundle==="VirtualBundle"||bundle==="HardBundle"){
                                    bootbox.alert('<b>' + bundleAlertMessager +'</b>');
                                }
                                if(compName === 'Walmart' && gl === 'gl_pet_products'){
                                    console.log('High PV');
                                    cur.setAttribute("data-target", "#popIden2");
                                    cur.setAttribute("data-toggle", "modalV3");
                                }
                            }
                        });
                    });
                }
            });
        }
        catch (e) {
            console.log("error in  popupAcknowledgement function ..", e);
        }
    }

    //==============================================voice recognition======================================================

    function checkTime(){
        let startTime = 1;
        let myInterval;
        let currentPage = location.href;

        const newEle = document.createElement("button");
        newEle.className = "timeSection";

        const styling = {
            position: 'fixed',
            top: '30px',
            right:'0px',
            zIndex: '7',
            backgroundColor: 'rgb(17, 154, 233)',
            color:'white',
            padding:'8px'
        };

        Object.assign(newEle.style, styling);
        document.body.appendChild(newEle);

        myInterval = setInterval(function () {
            if (currentPage != location.href) {
                clearInterval(myInterval);
                newEle.remove();
            }else{
                document.querySelector('.timeSection').innerHTML = startTime;
                startTime++;
            }
        }, 1000);
    }
    //=============================================================================================================================================//

    //===============================================================================Mapping Type=========================================================================

    function noniden(){
        try{
            function dumperAttr(){
                let allTabs = angular.element(document.querySelectorAll('.attrs.ng-scope'));
                for(let i=0; i<allTabs.length; i++){
                    if(allTabs[i].innerText.includes('UnitCount')){
                        let finalString = allTabs[i].innerText.replace(/\s+/g, ' ').trim().split(" ");
                        let attrArray = ["UnitCountType","ItemDisplayVolume","ItemDisplayWeight","Weight","Item_Weight","Item_Volume","Volume","NumberOfItems","Comp_IPQ"];

                        attrArray.forEach((cur)=>{
                            if(finalString.includes(cur)){
                                finalString.splice(finalString.indexOf(cur),0,'<br>');
                            }
                        });

                        let lastVal = finalString.slice(-1);
                        let displayString = finalString.join(" ").replace(/^ +/gm, '');
                        return [displayString, lastVal];
                    }
                }
            };
            let comment_box = document.querySelectorAll('textarea');
            let modalWin = document.querySelector('#popIden');
            let mapperName = angular.element(document.querySelector('.attrs')).scope().workItemController.workItemMap.mapperName;
            let [dispString, lastVal] = dumperAttr();

            let modalHTML = `
        <!-- Modal -->
        <div class="modal fade" id="popIden" role="dialog" style="top:20%;bottom:0%;left:15%;" data-keyboard="false" data-backdrop="static">
          <div class="modal-dialog" style="width:80%;">
           <div class="modal-content">
             <div class="modal-header">
              <h3 class="modal-title text-center" id="exampleModalLongTitle" >Mapping Type</h3>
             </div>
          <div class="modal-body">
        <b>Title</b> - ${angular.element(document.querySelector('.attrs')).scope().$$childHead.val}
        <div style="padding-top:8px;"><b>Dumper</b></div>
        <p>${dispString}</p>
          </div>
          <div class="modal-footer" style="padding:2em;" >
           <button type="button" id="noniden" class="btn btn-danger btn-lg" style="position: absolute;right: 10%;bottom:2%;" data-toggle="modalV3">Non-Identical</button>
           <button type="button" id="iden" class="btn btn-success btn-lg" style="position: absolute;left: 10%;bottom:2%;" data-toggle="modalV3">Identical</button>
         </div>
        </div>
       </div>
      </div>
        `;

            let afterModal = document.querySelector('body');
            afterModal.insertAdjacentHTML("beforeend", modalHTML);

            let allPanels = document.querySelectorAll('.panel-heading');
            allPanels.forEach((cur,i)=>{
                if(cur.innerText.includes('UnitCount')){
                    let identicalBtn = document.querySelector('#iden');
                    let nonIdenticalBtn = document.querySelector('#noniden');
                    let checker = document.querySelector('[ng-model="workItemController.workItem.auditResult"]');
                    let unitCountTab = allPanels[i];
                    let noErrBtn = document.querySelectorAll(`[ng-true-value="'No error'"]`)[i-1];
                    let errBtn = document.querySelectorAll(`[ng-true-value="'Error'"]`)[i-1];
                    let curErr = document.querySelectorAll(`[ng-true-value="'Error'"]`)[i];
                    let curNoErr = document.querySelectorAll(`[ng-true-value="'No error'"]`)[i];

                    noErrBtn.setAttribute("data-target", "#popIden");
                    noErrBtn.setAttribute("data-toggle", "modalV3");
                    errBtn.setAttribute("data-target", "#popIden");
                    errBtn.setAttribute("data-toggle", "modalV3");

                    identicalBtn.addEventListener('click',()=>{
                        comment_box[i].value = "Identical match";
                        comment_box[i].dispatchEvent(new Event('change'));
                        comment_box[i].dispatchEvent(new Event('input'));
                        identicalBtn.setAttribute("data-dismiss", "modalV3");
                        if(lastVal[0]===':' || lastVal[0]==='0' || lastVal[0]===0){
                            curNoErr.click();
                        }else{
                            curErr.click();
                        }
                    });

                    nonIdenticalBtn.addEventListener('click',()=>{
                        comment_box[i].value = "Non-Identical match";
                        comment_box[i].dispatchEvent(new Event('change'));
                        comment_box[i].dispatchEvent(new Event('input'));
                        nonIdenticalBtn.setAttribute("data-dismiss", "modalV3");
                        if(lastVal[0]===':' || lastVal[0]==='0' || lastVal[0]===0){
                            curErr.click();
                        }else{
                            curNoErr.click();
                        }
                    });
                }
            });
        }
        catch(e){console.log('unit count tab not found',(e))};
    }

    //==============================================================================voice command======================================================================

    function listenZircon(){

        if ((location.href.includes("https://zircon-na.aka.amazon.com/")) || (location.href.includes("https://zircon-eu.aka.amazon.com/")) || (location.href.includes("https://zircon-fe.aka.amazon.com/"))) {
            function textToSpeech(text){
                const voices = speechSynthesis.getVoices();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 1;
                voices.forEach(cur=>{
                    if(cur.name === 'Google हिन्दी'){
                        utterance.voice = cur;
                    }
                });
                speechSynthesis.speak(utterance);
            }

            console.log('hello');
            window.speechRecognition = window.speechRecognition || window.webkitSpeechRecognition;

            const recognition = new window.speechRecognition();
            recognition.interimResults = true;

            recognition.addEventListener('result',(e)=>{

                const completeText = Array.from(e.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');

                if(e.results[0].isFinal){

                    //console.log(completeText);

                    if(completeText === 'hello'){
                        textToSpeech("hello. I'm zircon");
                    }else if(completeText.includes('open guidelines')){
                        window.open('https://share.amazon.com/sites/CMTLnD/Mapping%20Guidelines_new/_layouts/15/start.aspx#/SitePages/Home.aspx');
                        textToSpeech("opening guidelines");
                    }else if(completeText.includes('open phone tool')){
                        window.open('https://phonetool.amazon.com/');
                        textToSpeech("opening phone tool");
                    }else if(completeText.includes('open FM ID') || completeText.includes('open afm ID')){
                        window.open('https://quip-amazon.com/dXLYA8m6T7RR/AFM-Maaping-ID#FEE9CA2gwZc');
                        textToSpeech("opening AFM ID base");
                    }else if(completeText.includes('open site training exceptions') || completeText.includes('open sight training exceptions')){
                        window.open('https://w.amazon.com/bin/view/ST_Exceptions_PARS');
                        textToSpeech("opening site training exceptions");
                    }else if(completeText.includes('open recap')){
                        window.open('https://recap.amazon.com/#/publish-data/');
                        textToSpeech("opening recap");
                    }
                }

            });

            recognition.addEventListener('end',()=>{
                recognition.start();
            });

            recognition.start();
        }
    }

    //==============================================================================Gender dectector======================================================================

    function detectGender(){
        //pop-up template
        let popupModal = `
        <!-- Modal -->
        <div class="modal fade" id="gendect" role="dialog" style="top:10%;bottom:0%;left:15%;" data-keyboard="false" data-backdrop="static">
          <div class="modal-dialog" style="width:80%;">
           <div class="modal-content">
             <div class="modal-header">
              <h3 class="modal-title text-center" id="exampleModalLongTitle" >Gender Alert</h3>
             </div>
          <div class="modal-body">
        <p id="errorGen">Gender present in amazon product description: <b id="gentypepr" style="color:red"></b> <br><br>Please check and compare the gender present on amazon and competitor.</p>
        <br><p><b>Note: This listing will be automatically tagged as "Error" as per gender logic if the gender is different as per the given SOP else check for any exception before taking the audit decision.<b></p>
        <br><p>Please enter the competitor gender below.</p>
           <input
           type="text"
           autocomplete="off"
           required
           style="width: 172px"
           class="form-control"
           id="genInp"
           placeholder="Enter comp gender"
         />
          </div>
          <div class="modal-footer" style="padding:0.5em;" >
           <button type="submit" aria-label="Close" id="gackCls" class="btn btn-success btn-lg">Acknowledge</button>
         </div>
        </div>
       </div>
      </div>
        `;

        let afterModal = document.querySelector('body');
        afterModal.insertAdjacentHTML("beforeend", popupModal);//data-dismiss="modalV3"
        function textToSpeech(text){
            const voices = speechSynthesis.getVoices();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            voices.forEach(cur=>{
                if(cur.name === 'Google हिन्दी'){
                    utterance.voice = cur;
                }
            });
            speechSynthesis.speak(utterance);
        }

        //variables
        let genders = {
            'male' : ['men','man','mens','mans','male','gentlemen','masculine'],
            'female' : ['women','woman','womens','womans','female','lady','ladies','feminine'],
            'boy' : ['boys','boy'],
            'girl' : ['girls','girl'],
            'kid' : ['infant','infants','toddler','toddlers','newborn','baby','babies','kids','kid','child','youth','children','childs','childrens'],
            'unisex' : ['unisex','adult']
        };

        let prDescKey = [];
        let urlGen = [];
        let audinp = [];

        let compURL = angular?.element(document.querySelector('.attrs'))?.scope()?.workItemController?.workItemMap?.current_url?.toLowerCase();
        console.log(compURL);
        let GL_group = angular?.element(document.querySelector('.attrs'))?.scope()?.workItemController?.workItemMap?.Gl;
        let MKPL = angular?.element(document.querySelector('.attrs'))?.scope()?.workItemController?.workItemMap?.Marketplace;
        let allPanels = document.querySelectorAll('.panel-heading');
        let allPanelsTitle = document.querySelectorAll('.panel-title');
        let innText = angular?.element(document.querySelectorAll('.attrs.ng-scope'));
        let comment_box = document.querySelectorAll('textarea');

        tabsInfo("ProductDescription");

        function modBody(index){
            let noErrBtn = document.querySelectorAll(`[ng-true-value="'No error'"]`)[index-1];
            let errBtn = document.querySelectorAll(`[ng-true-value="'Error'"]`)[index-1];
            noErrBtn.addEventListener('click', ()=>{
                //textToSpeech("Gender alert! please read carefully.");
            });
            errBtn.addEventListener('click', ()=>{
                //textToSpeech("Gender alert! please read carefully.");
            });
            noErrBtn.setAttribute("data-target", "#gendect");
            noErrBtn.setAttribute("data-toggle", "modalV3");
            errBtn.setAttribute("data-target", "#gendect");
            errBtn.setAttribute("data-toggle", "modalV3");
        }

        function tabsInfo(tabname){
            if((GL_group === 'gl_shoes' || GL_group ==='gl_apparel') && (MKPL === '1' || MKPL === '7')){
                let innGenpr = document.querySelector('#gentypepr');
                for(let i=0; i<innText.length; i++){
                    if(innText[i].innerText.includes(tabname)){
                        let genderDescription = innText[i]?.innerText?.toLowerCase()?.split('\n');//product description data
                        genderDescription.forEach((curgen,i)=>{
                            for(let [keys,values] of Object.entries(genders)){
                                for(let j=0; j<values.length; j++){
                                    if(values[j] === curgen){
                                        prDescKey.push(keys);
                                        innGenpr.innerHTML = curgen.toUpperCase();
                                    }
                                }
                            }
                        });
                    }
                }
                for(let [keys,values] of Object.entries(genders)){
                    for(let j=0; j<values.length; j++){
                        if(compURL.includes(values[j])){
                            urlGen.push(keys);
                        }
                    }
                }
                let productDescGender = prDescKey.slice(-1)[0];
                let URLgender = urlGen.slice(-1)[0];

                //main
                if(productDescGender === URLgender){
                    console.log("No conflict");
                }else{
                    console.log("There is a conflict");
                    allPanels.forEach((cur,i)=>{
                        if(cur.innerText.includes(tabname)){
                            let errBtn = document.querySelectorAll(`[ng-true-value="'Error'"]`)[i];
                            let noErrBtn = document.querySelectorAll(`[ng-true-value="'No error'"]`)[i];
                            let input_box = document.querySelector('#genInp');
                            let confir_btn = document.querySelector('#gackCls');

                            confir_btn.addEventListener('click',()=>{
                                if(input_box.value !== ""){
                                    //setTimeout(()=>{confir_btn.setAttribute("data-dismiss", "modalV3")},3000);
                                    confir_btn.setAttribute("data-dismiss", "modalV3");
                                    let userInput = input_box.value.toLowerCase();
                                    for(let [keys,values] of Object.entries(genders)){
                                        for(let j=0; j<values.length; j++){
                                            if(userInput === values[j] || userInput.includes(values[j])){
                                                audinp.push(keys);
                                            }
                                        }
                                    }
                                    let auditorInput = audinp.slice(-1)[0];
                                    console.log(auditorInput, productDescGender);
                                    if(auditorInput===productDescGender){
                                        noErrBtn.click();
                                        textToSpeech("Thanks for input. marking as gender no error.");
                                    }else{
                                        errBtn.click();
                                        textToSpeech("Thanks for input. marking as gender error.");
                                    }

                                    comment_box[i].value = `Competitor Gender: ${userInput}`;
                                    comment_box[i].dispatchEvent(new Event('change'));
                                    comment_box[i].dispatchEvent(new Event('input'));
                                    allPanelsTitle[i].click();
                                }else{
                                    confir_btn.setAttribute("data-dismiss", "#");
                                }
                            });
                            modBody(i);
                        }
                    });
                }
            }
        }
    }//end of detectGender function

})();