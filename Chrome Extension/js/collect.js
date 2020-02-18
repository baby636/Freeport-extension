function pageCollectBrowse(){
    
    $("#page-container-collect-content").html("<div align='center'><i class='fa fa-spinner fa-spin fa-3x fa-fw'></i></div>")
    
    $("#page-container-collect").addClass("hide")
    $("#page-container-collect-content").removeClass("hide")
    
    var source_html = "https://alphamask.io/api/list/collections"
    var collection = ""
    
    $.getJSON( source_html, function( data ) { 
        //collection += "<div align='left' style='padding: 0 0 30px 0;'><button id='page-collect-back-button' type='button' class='btn btn-xs btn-back'><- Back</button></div>"
        $("#leftbar-container").html("<div id='page-collect-back-button-container' align='left' style='position: fixed; top: 50%; left: 0px; vertical-align: middle; transform: translateY(-50%);'><button id='page-collect-back-button' type='button' class='btn btn-back'><i class='fa fa-arrow-left fa-2x'></i></button></div>")
        collection += "<h2>Collections</h2><div class='row'>"
        for(var i=0; i < data.length; i++){
            var collection_id = data[i]['collection'].split(' ').join('-').toLowerCase()   
            collection += "<div class='col-sm-6 col-md-4 col-lg-3 col-xl-2 collection-item' align='center' style='height: 220px; padding-top: 20px' data-url='https://digirare.com/collections/"+collection_id+"'>"
            collection += "<div style=''><img src='"+data[i]['img']+"' width='110px'></div>"
            collection += "<div class='lead' style='font-weight: bold;'>"+data[i]['collection']+"</div>"
            collection += "</div>"
        } 
        collection += "</div>"
        
        $("#page-container-collect-content").html(collection)
    })
}


function pageCollectInventory(address){
    
    $("#page-container-collect-content").html("<div align='center'><i class='fa fa-spinner fa-spin fa-3x fa-fw'></i></div>")
    
    $("#page-container-collect").addClass("hide")
    $("#page-container-collect-content").removeClass("hide")
    
    var source_html = "https://digirare.com/api/wallet/"+address
    
    $.getJSON( source_html, function( data ) {
        pageCollectInventoryXchain(address, data)
    }).fail(function(){
        var emptyData = {data: []}
        pageCollectInventoryXchain(address, emptyData)
    })
}

function getXchainBalances(address, callback){

    var url = "https://xchain.io/api/balances/"+address
    $.getJSON( url, function( dataInit ) {

        if(dataInit.total <= 500){
            callback(dataInit)
        } else {
 
            var pages = Math.ceil(dataInit.total / 500)
            var urls = []
            
            for(var i=2; i <= pages; i++){
                urls[i-2] = "https://xchain.io/api/balances/"+address+"/"+i
            }

            var allData = dataInit.data
            
            Promise.all(urls.map(url => $.getJSON(url))).then(function(data){

                for(var i=0; i < data.length; i++){
                    for(var k=0; k < data[i].data.length; k++){
                        allData.push(data[i].data[k])
                    }
                }
                
                var dataFinal = {address: address, data: allData, total: dataInit.total};
                
                callback(dataFinal)
                
            })
        }

    })
}

function pageCollectInventoryXchain(address, data){

    var collection = ""
    var collectionUnknown = ""
    var cardName, cardImage, isLongname, isLargeCollection, isEmptyCollection, cardDivisible, cardQty, collectionEntry, cardAlias, display_name, cardFreeport

    getXchainBalances(address, function(data_xchain) {

            collection += "<div align='center' style='position: relative; top: -30px; background-color: #38444f; margin: 0 0 32px 0;'>My Collection</div>"
            
            collection += "<div align='right' style='margin: -50px 0 0 0;'><input id='imageToggle' type='checkbox' data-toggle='toggle' data-on='Images On' data-off='Images Off' data-size='mini' checked></div>"
            

            collection += "<div class='row' style='margin: 12px 0 0 0;'>"

            //console.log(data)

            if(data.length == 0 && data_xchain.total == 0){
                data['data'] = []
                isEmptyCollection = true
            } else {
                isEmptyCollection = false
            }


           //get image URLs from digirare
            
            var digirareAsset
            var digirareImageArray = []
  
            if(data['data']){
                var assetArrayLength = data['data'].length
                for(var i=0; i < assetArrayLength; i++){
                    digirareAsset = data['data'][i]['asset']['name']
                    if(data['data'][i]['card']){ 
                        digirareImageArray[digirareAsset] = data['data'][i]['card']['image']
                    }    
                }
            }
            //console.log(digirareImageArray)

            for(var i=0; i < data_xchain['total']; i++){
                
                if(data_xchain['data'][i]['quantity'].indexOf('.') < 0){
                    cardDivisible = false
                } else {
                    cardDivisible = true
                }

                cardName = data_xchain['data'][i]['asset']
                cardDescription = data_xchain['data'][i]['description']
                cardQty = data_xchain['data'][i]['quantity']
                cardQty = Number(cardQty).toFixed(8).replace(/\.?0+$/,"")
                cardAlias = ""
                cardFreeport = false
                
                if(digirareImageArray[cardName]){
                    cardImage = digirareImageArray[cardName]
                } else {
                    cardImage = "../images/unknown.png"
                    if(cardDescription.length >= 16){
                        var checkImgur = cardDescription.substring(0, 5);
                        if(checkImgur == "imgur"){
                            cardFreeport = true
                            var descArray = cardDescription.split(";");
                            cardImage = "https://i.imgur.com/"+descArray[0].substring(6);
                            cardAlias = descArray[1]
                        }
                    }
                } 

                if(cardFreeport){
                    display_name = cardAlias
                    cardAlias = encodeURIComponent(cardAlias).replace("'", "%27")
                    cardDescription = encodeURIComponent(cardDescription).replace("'", "%27")
                } else {
                    if(data_xchain['data'][i]['asset_longname'] == ""){
                        display_name = data_xchain['data'][i]['asset']
                    } else {
                        display_name = data_xchain['data'][i]['asset_longname']
                    }  
                    cardAlias = display_name
                }

                collectionEntry = ""
                collectionEntry += "<div class='col-sm-6 col-md-4 col-lg-3 col-xl-2 collection-item-asset' style='padding: 20px 0 16px 0' data-assetname='"+cardName+"' data-assetimage='"+cardImage+"' data-divisible='"+cardDivisible+"' data-quantity='"+cardQty+"' data-description='"+cardDescription+"' data-alias='"+cardAlias+"'>"
                collectionEntry += "<div align='center' style='margin: auto;'><div class='lozad collection-asset-images' data-background-image='"+cardImage+"' style='width: 120px; height: 120px; background-size: contain; background-repeat: no-repeat; background-position: center bottom; margin-bottom: 8px;'></div>"
                collectionEntry += "<div class='inventory-asset-name' style='font-weight: bold; padding: 0 8px 0 8px;'>"+display_name+"</div>"
                collectionEntry += "<div class='inventory-asset-qty' style='font-size: 11pt; color: #FFEB70;'>x"+cardQty+"</div>"
                collectionEntry += "</div></div>"

                //b3ffcc
                if(cardImage != "../images/notrare.jpg"){
                    collection += collectionEntry
                } else {
                    collectionUnknown += collectionEntry
                }

            } 
            collection += collectionUnknown

            if(isEmptyCollection){
                collection += "<div class='col lead' align='center' style='margin: 25px 0 35px 0; padding: 20px; width: 100%; text-align: center;'>There's nothing in this collection!</div>"
            }

            collection += "<div class='col-12 collection-item-asset-end' style='padding: 20px 0 16px 0'>"
            collection += "<div id='page-collect-search-select' style='font-size: 14pt; font-weight: bold; width: 100%; text-align: center'><i class='fa fa-search'></i> Search assets at digirare.com</div>"
            collection += "</div></div>"

            collection += "</div>"

            $("#page-container-collect-content").html(collection)

            //const observer = lozad(); // lazy loads elements with default selector as '.lozad'
            observer.observe();
        
            $('#imageToggle').bootstrapToggle()

    })

}


function pageCollectAsset(assetname, assetimage, assetdivisible, assetquantity, assetdescription, assetalias, ypos){
    
    //$("#page-container-collect-content").html("<div align='center'><i class='fa fa-spinner fa-spin fa-3x fa-fw'></i></div>")
    $("#page-container-collect-assetview").html("<div align='center'><i class='fa fa-spinner fa-spin fa-3x fa-fw'></i></div>")

    //$("#page-container-collect-content").show()
    $("#page-container-collect").addClass("hide")
    
    $("#page-container-collect-content").addClass("hide")
    $("#page-container-collect-assetview").removeClass("hide")
    
    console.log(ypos)
    
    var backButton = "<div align='left' style='position: fixed; top: 50%; left: 0px; vertical-align: middle; transform: translateY(-50%);'><button id='page-inventory-back-button' type='button' class='btn btn-back' data-ypos='"+ypos+"'><i class='fa fa-arrow-left fa-2x'></i></button></div>"
    
    $("#leftbar-container").html(backButton)
      
    var assetInfo = ""
    var twitterAlias = ""
    
    assetquantity = Number(assetquantity).toFixed(8).replace(/\.?0+$/,"")
    
    assetInfo += "<div align= 'center' style='position: relative; top: -30px; background-color: #38444f;'>Asset Information</div>"
    assetInfo += "<div style='padding: 0 15px 0 15px;'>"
    assetInfo += "<div class='row' style='width: 100%; padding: 0 0 28px 0; text-align: center; margin: auto;'><div class='col'><button type='button' class='btn btn-primary btn-lg btn-block asset-send-button' data-image='"+assetimage+"' data-asset='"+assetname+"' data-qty='"+assetquantity+"' data-divisible='"+assetdivisible+"' data-alias='"+assetalias+"'><strong>SEND</strong></button></div><div class='col'><button type='button' class='btn btn-warning-white btn-lg btn-block asset-sell-button' data-image='"+assetimage+"' data-asset='"+assetname+"' data-qty='"+assetquantity+"' data-divisible='"+assetdivisible+"' data-alias='"+assetalias+"''><strong>SELL</strong></button></div></div>"
    
    //<div class='col'><button type='button' class='btn btn-info btn-block asset-trade-button' data-image='"+assetimage+"' data-asset='"+assetname+"' data-qty='"+assetquantity+"' data-divisible='"+assetdivisible+"' data-alias='"+assetalias+"''>Trade</button></div>
    
    //<div class='col'><button type='button' class='btn btn-success btn-block' disabled>Gift (Soon!)</button></div><div class='col'><button type='button' class='btn btn-warning btn-block' disabled>Bonus (Soon!)</button></div>
    
    var source_html = "https://xchain.io/api/asset/"+assetname
    
    $.getJSON( source_html, function( data ) {
        
        checkRegistry(data.issuer, function(registry){
            
            console.log(registry)
        
            checkAnchors(data.issuer, function(anchors){
            
                imageToHash(assetimage, function(imageHashFromUrl){

                    if(assetalias.length > 0){
                        var assetname_display = decodeURIComponent(assetalias) + " <div style='font-size: 12px; color: #868e96;'>ID // <span style='color: #D3BDB0;'>" + assetname + "</span></div>"
                        assetdescription = ""
                    } else {
                        assetalias = assetname
                        assetdescription = "<h4>"+assetdescription+"</h4>"
                        var assetname_display = assetname
                    }
                    
                    if(!registry.error){
                        twitterAlias += "<div id='container-collect-issuer-twitter' data-twitter='"+registry.twitter.username+"' style='padding: 8px 0 0 0; cursor: pointer;'>"
                        twitterAlias += "<div style='display: inline-block;'><img src='http://avatars.io/twitter/"+registry.twitter.username+"/small' class='rounded-circle'></div>"
                        twitterAlias += "<div style='display: inline-block; margin-left: 8px; font-size: 24px; font-weight: 600;'>@"+registry.twitter.username+"</div>"
                        twitterAlias += "<div style='display: inline-block; margin-left: 8px; color: #1a97f0;'><i class='fa fa-twitter'></i></div>"
                        twitterAlias += "</div>"
                        twitterAlias += "<div style='font-size: 12px; font-weight: bold; word-break: break-all; padding: 8px 0 8px 0;'>"+data.issuer+"</div>"
                    } else {
                        twitterAlias += "<div style='font-weight: bold; word-break: break-all;'>"+data.issuer+"</div>"
                    }

                    assetInfo += "<div class='row' style='background-color: #38444F;'><div id='container-collect-asset-name' class='col-lg-6' style='padding: 10px 10px 10px 20px; font-size: 32px; font-weight: bold;'>"+assetname_display
                    assetInfo += "<div><div class='mr-3' style='display: inline-block;'><button type='button' class='btn btn-info btn-xs asset-tweet-share-button' data-asset='"+assetname+"' data-alias='"+assetalias+"' data-image='"+assetimage+"'><i class='fa fa-twitter' aria-hidden='true'></i> Share on Twitter</button></div><div class='' style='display: inline-block;'><button type='button' class='btn btn-default btn-xs asset-tweet-who-button' data-asset='"+assetname+"'><i class='fa fa-twitter' aria-hidden='true'></i> See who's tweeting about this</button></div></div>"
                    assetInfo += "</div><div id='container-collect-asset-qty' class='col-lg-6'><div style='font-weight: bold; color: #FFEB70; padding: 10px 0 10px 0; font-size: 32px;'><span style='font-size: 18px;'>x </span>"+assetquantity+"</div></div></div>"
                    assetInfo += "<div class='row' style='background-color: #D3BDB0;'>"
                    assetInfo += "<div class='col-lg-6' align='center' style='padding: 20px;'>"
                    assetInfo += "<img src='"+assetimage+"' style='max-width: 100%;'></div>"
                    assetInfo += "<div class='col-lg-6' style='font-weight: bold; padding: 20px; color: #38444f;'>"
                    assetInfo += assetdescription

                    assetInfo += "<div style='font-size: 18px; font-weight: 300;'>Created By:"
                    assetInfo += twitterAlias 

                    assetInfo += "</div>"
                    assetInfo += "<div style='font-size: 18px; font-weight: 300; padding-top: 10px;'>Total Issued:<br><span style='font-weight: bold;'>"+data.supply+"</span></div>"
                    assetInfo += "<div style='font-size: 18px; font-weight: 300; padding-top: 10px;'>Divisible:<br><span style='font-weight: bold;'>"+data.divisible+"</span></div>"
                    assetInfo += "<div style='font-size: 18px; font-weight: 300; padding-top: 10px;'>Locked:<br><span style='font-weight: bold;'>"+data.locked+"</span></div>"

                    if(anchors[assetname]){
    //                    assetInfo += "<div style='font-size: 18px; font-weight: 300; padding-top: 10px;'>Image Anchor Hash:<br><span style='font-weight: bold;word-break: break-all;'>"+anchors[assetname]+"</span></div>"

                        console.log(base64ToHex(imageHashFromUrl))
                        console.log(anchors[assetname])

                        if(base64ToHex(imageHashFromUrl) == anchors[assetname]){
                            assetInfo += "<div style='font-size: 18px; font-weight: 300; padding-top: 10px; color: green;'><i class='fa fa-anchor' aria-hidden='true'></i> Image Anchor Secured</div>"
                        } else {
                            assetInfo += "<div style='font-size: 18px; font-weight: 300; padding-top: 10px; color: red;'>Image Doesn't Match Anchor!</div>"
                        }
                    }

                    assetInfo += "</div></div></div></div>"

                    
                    
                    //$("#page-container-collect-content").html(assetInfo)
                    $("#page-container-collect-assetview").html(assetInfo)
                    

                })
            })  
        })
    })
    
//    assetInfo += "</div>"
//    
//    assetInfo += "</div>"
//    assetInfo += "</div>"
//    assetInfo += "</div>"


    
    
}

function saveInventoryLocal(feed){
//chrome.storage.local.set({key: value}, function() {
//          console.log('Value is set to ' + value);
//        });
//      

}
function loadInventoryLocal(){
    chrome.storage.local.get(['inventory'], function(result) {
        return result
    });
}

function pageCollectSearchModal(){
    
    var searchAssetDialog = new BootstrapDialog({
        title: 'Search by Name',
        cssClass: 'modal-nofade',
        closable: false,
        message: $('<div></div>').load('../html/modal/dialog-collect-search.html'),
        buttons: [
            {
                label: 'Search',
                cssClass: 'btn-primary',
                action: function(dialogItself) { 
                    var searchterm = dialogItself.getModalBody().find('input').val()
                    var url = "https://digirare.com/browse?keyword="+searchterm+"&collection=&format="
                    window.open(url, '_blank', "width=800,height=600,top=50,left=50")
                    dialogItself.close()
                }
            },
            {
                label: 'Close',
                cssClass: 'btn-secondary',
                action: function(dialogItself) { 
                    
                            dialogItself.close()

                }
            }
        ]
    });
    searchAssetDialog.open()
    
    
}


//chrome.storage.local.get(['fee_custom'], function(result) {
//    sendAssetModal(asset, divisible, balance, result.fee_custom)
//})



function sendAssetModal(asset, assetImage, divisible, balance, fee_custom){
    
    feeRecommendedCallback2(function(fee_recommended_priority, fee_recommended_economy){
        
        var txfeebutton = addFeeButtons(fee_recommended_priority, fee_recommended_economy)
                            

        var btcbalance = $("#body").data("balance_btc")

        var sendAssetDialog = new BootstrapDialog({
        title: "Send " + asset,
        cssClass: "modal-nofade",
        //message: $('<div></div>').load('html/dialog-send-asset.html'),
        message: function(dialog){

                        var $message = $('<div></div>').load('modal/dialog-send-asset.html', function(){
                            $(this).find("#dialogSendAsset-balance").html(balance)
                            $(this).find(".dialogSendAsset-asset").html(asset)
                            if(asset != "BTC"){
                                var assetImageHtml = "<img src='"+assetImage+"' width='240px'>"
                                $(this).find("#dialogSendAsset-icon-lg").html(assetImageHtml)
                            } else {
                                var assetImageHtml = "<img src='"+assetImage+"'>"
                                $(this).find("#dialogSendAsset-icon-lg").html(assetImageHtml)
                                
                                $(this).find("#dialogSendAsset-memo-hex-group").addClass("hide")
                                $(this).find("#addbtc-form-group").addClass("hide")
                                $(this).find("#dialogSendAsset-memo-group").addClass("hide")
                            }

                            $(this).find(".dialog-transfee").html(fee_custom)
                            
                            
                            $(this).find('.dialog-txfeebutton').html(txfeebutton)

                        })

                        return $message

                },
        buttons: [
        {
            id: 'send-btn',
            label: 'Send',
            cssClass: 'btn-success',
            action: function(dialogItself) {

                    var passphrase = $("#body").data("passphrase")

                    var sendtoamount = dialogItself.getModalBody().find('#dialogSendAsset-amount').val()
                    var add_to = dialogItself.getModalBody().find('#dialogSendAsset-address').val()
                    var add_from = $("#body").data("address")  

                    var btc_total = parseFloat($("#body").data("balance_btc")) / 100000000

                    var transfee = (parseFloat($("#body").data("fee_btc")) * 100000000)/100000000
                    console.log(transfee)

                    if(!divisible){
                        sendtoamount = Math.floor(sendtoamount) / 100000000
                    } 
                    console.log(sendtoamount)

                    if (asset == "BTC") {
                        var totalsend = sendtoamount + transfee
                        balance = parseFloat(btc_total)
                    } else {
                        var totalsend = parseFloat(sendtoamount)
                    }

                    console.log(add_from)

                    if (isValidAddress(add_to)){
                        if (isNaN(sendtoamount) == true || sendtoamount <= 0 || $.isNumeric( sendtoamount ) == false) {
                            //Invalid Amount
                            dialogItself.getModalBody().find('#dialogSendAsset-header').html("Invalid amount.")
                        } else {
                            
                            //console.log("made it?")
                            
                            if (totalsend > balance) {
                                //Insufficient Funds
                                dialogItself.getModalBody().find('#dialogSendAsset-header').html("Insufficient funds.")
                            } else {      
                                
                                //console.log("made it?")
                                
                                if (asset == "BTC") {
                                    
                                    dialogItself.getModalBody().find('#dialogSendAsset-header').html("<i class='fa fa-spinner fa-spin fa-3x fa-fw'></i><span class='sr-only'>Loading...</span>")
                                    sendBTC_test(add_from, add_to, sendtoamount, transfee, passphrase, function(signedtx){
                                        //push tx to network
                                        if(signedtx != "error") {
                                            console.log("success!")
                                             sendRawSignedTx(signedtx, function(status, txid){
                                                if (status == "success") {
                                                    dialogItself.getModalBody().find('#dialogSendAsset-container').html("<div><div style='padding: 15px 0 15px 0; font-weight: bold; font-size: 18px;'>Transaction Sent!</div><i class='fa fa-check fa-3x' aria-hidden='true'></i></div><div style='padding: 15px 0 15px 0;'><a href='https://live.blockcypher.com/btc/tx/"+txid+"' target='_blank'>View your Transaction</a></div>")  
                                                    dialogItself.setClosable(false)
                                                    $("body").data("sendTx", true)
                                                } else {
                                                    dialogItself.getModalBody().find('#dialogSendAsset-header').html("Error")
                                                }   
                                            })                                 
                                        } else {
                                            dialogItself.getModalBody().find('#dialogSendAsset-header').html("Error")
                                        }
                                    })
                                    
                                    
                                } else if (btc_total > transfee) { //check if enough btc balance for tx fee
                                    
                                    //console.log("made it?")
                                    
                                    dialogItself.getModalBody().find('#dialogSendAsset-header').html("<i class='fa fa-spinner fa-spin fa-3x fa-fw'></i><span class='sr-only'>Loading...</span>")
                                    
                                    var memo = ""
                                    memo = dialogItself.getModalBody().find('#dialogSendAsset-memo').val() 
                                    
                                    if(dialogItself.getModalBody().find("#dialogSendAsset-memo-hex").is(':checked')){
                                        var memo_type_hex = true
                                    } else {
                                        var memo_type_hex = false
                                    }
                                    
                                    console.log(memo_type_hex)
                                    
                                    enhancedSendXCP_opreturn_test(add_from, add_to, asset, sendtoamount, memo, memo_type_hex, transfee, passphrase, function(signedtx){
                                        
                                        //push tx to network
                                        if(signedtx != "error") {
                                            
                                            console.log(signedtx)
                                            
                                            sendRawSignedTx(signedtx, function(status, txid){
                                                if (status == "success") {
                                                    dialogItself.getModalBody().find('#dialogSendAsset-container').html("<div><div style='padding: 15px 0 15px 0; font-weight: bold; font-size: 18px;'>Transaction Sent!</div><i class='fa fa-check fa-3x' aria-hidden='true'></i></div><div style='padding: 15px 0 15px 0;'><a href='https://xchain.io/tx/"+txid+"' target='_blank'>View your Transaction</a></div>")  
                                                    dialogItself.setClosable(false)
                                                    $("body").data("sendTx", true)
                                                } else {
                                                    dialogItself.getModalBody().find('#dialogSendAsset-header').html("Error")
                                                }   
                                            })        
                                        } else {
                                            dialogItself.getModalBody().find('#dialogSendAsset-header').html("Error")
                                        }
                                    }) 
                                    
                                } else {
                                    dialogItself.getModalBody().find('#dialogSendAsset-header').html("Insufficient BTC for transaction fee.")
                                }
                            }

                        }
                    } else {
                        //Invalid Address
                        dialogItself.getModalBody().find('#dialogSendAsset-header').html("Not a valid address.")
                    }

                    dialogItself.getModalBody().find('#dialogSendAsset-amount').prop('disabled', true)
                    dialogItself.getModalBody().find('#dialogSendAsset-address').prop('disabled', true)
                    dialogItself.getModalBody().find('#dialogSendAsset-addbtc').prop('disabled', true)
                    dialogItself.getModalBody().find('#dialogSendAsset-memo').prop('disabled', true)
                    dialogItself.getButton('send-btn').toggleEnable(false) 




            }
        },
        {
            label: 'Close',
            cssClass: 'btn-default',
            action: function(dialogItself) {

                if($("body").data("sendTx") == true){
  
                    getUnconfirmed($("#body").data("address"), function(data){
                        updateUnconfirmed(data)
                    })
                    
                    $("body").data("sendTx", false)

                }
                dialogItself.close()

            }
        }]
        })

    //    sendAssetDialog.realize()   
    //    sendAssetDialog.enableButtons(false)	

        sendAssetDialog.open() 


    })
    
    
}

