function tradeAssetModal_test(){ 
    tradeAssetModal("SELL", "PEPECASH", true, 3000, "A11118910935821212596", false, 1)
}

function getAssetBalance(address, asset, callback){
    getXchainBalances(address, function(data){         
        for(var i=0; i < data.total; i++){
            if(data.data[i].asset == asset){
                callback(data.data[i].quantity)
            }
        }        
    })
    
}

function getTradeCoinModal(assetname, assetimage, assetdivisible, assetqty, assetalias){
    
    var getTradeCoinModalDialog = new BootstrapDialog({
        title: "Trade "+decodeURIComponent(assetalias),
        id: "tradeCoinModal",
        cssClass: "modal-nofade tradeModalEvent",
        message: function(dialog){       
           //coin select asset function
 
            var $message = $('<div></div>').load('modal/dialog-coinselect.html', function(){
                $(this).find("#coinselect-tradeAsset").html(assetname)
                
                $(this).find("#coinselect-tradeAssetAlias").html(decodeURIComponent(assetalias)) 
                
                var assetImageHtml = "<img src='"+assetimage+"' width='240px'>"
                $(this).find("#coinselect-tradeAssetImage").html(assetImageHtml) 
            })
            
            return $message
            
        }, 
        buttons: [
            {
                id: "btn-coinselect",
                label: 'Trade',
                cssClass: 'btn-success',
                action: function(dialogItself) {
                                        
                    var action = dialogItself.getModalBody().find("#actionSelectDropdown").val();
                    var coinname = dialogItself.getModalBody().find("#coinSelectDropdown").val();
                    var coindivisible = true
 
                    if(action == "BUY"){
                        //tradeAssetModal("SELL", "PEPECASH", true, 3000, "A11118910935821212596", false, 1)
                        tradeAssetModal(action, assetimage, assetalias, assetname, assetdivisible, 0, coinname, coindivisible, 0)  
                    } else {
                        tradeAssetModal(action, assetimage, assetalias, coinname, coindivisible, 0, assetname, assetdivisible, 0)  
                    }
                    
                    getTradeCoinModalDialog.close()
                      
                } 
            },
            {
                id: "btn-closeOrder",
                label: 'Close',
                cssClass: 'btn-default',
                action: function(dialogItself) {
                    
                    getTradeCoinModalDialog.close()   

                } 
            }
        ]
    })

    getTradeCoinModalDialog.open()   
    
}

function closeOpenModal(callback){
    
}


function tradeAssetModal(action, action_asset_image, action_asset_alias, get_asset, get_asset_divisible, get_asset_qty, give_asset, give_asset_divisible, give_asset_qty, fee_custom){
    
     
    
     feeRecommendedCallback2(function(fee_recommended_priority, fee_recommended_economy){
        
        var fee = (parseFloat($("#body").data("fee_btc")) * 100000000)/100000000
        var txfeebutton = addFeeButtons(fee_recommended_priority, fee_recommended_economy)  

        var title, get_asset_amount, give_asset_amount, price_buy, price_sell, actionDisplay
        
        if(action == "BUY"){
            //title = "Get "+get_asset
            title = "Get "+decodeURIComponent(action_asset_alias)
            actionDisplay = "GET"
            actionDisplayOpp = "GIVE"
        } else {
            //title = "Give "+give_asset
            title = "Give "+decodeURIComponent(action_asset_alias)
            actionDisplay = "GIVE"
            actionDisplayOpp = "GET"
        }
         
        if(get_asset_divisible){
            get_asset_amount = parseFloat(get_asset_qty)
        } else {
            get_asset_amount = parseInt(get_asset_qty)
        }
         
        if(give_asset_divisible){
            give_asset_amount = parseFloat(give_asset_qty)
        } else {
            give_asset_amount = parseInt(give_asset_qty)
        }
        
//        if(give_asset_amount == 0 && get_asset_amount == 0){
//            price_buy = 0         
//            price_sell = 0
//        } else {
//            price_buy = give_asset_amount / get_asset_amount         
//            price_sell = get_asset_amount / give_asset_amount
//        }
         
             
        var tradeAssetDialog = new BootstrapDialog({
            title: title,
            id: "tradeAssetModal",
            cssClass: "modal-nofade tradeModalEvent",
            message: function(dialog){
   
                    dialog.getButton('btn-previewOrder').disable()

                    //tradeAssetDialog.setClosable(false)

                    var $message = $('<div></div>').load('modal/dialog-trade-asset.html', function(){
                        
                        var assetImageHtml = "<img src='"+action_asset_image+"' width='240px'>"
                        $(this).find("#dialogTradeAsset-assetImage").html(assetImageHtml)
                        $(this).find(".dialogTradeAsset-assetAlias").html(decodeURIComponent(action_asset_alias))
                        
                        $(this).find(".dialogTradeAsset-action").html(actionDisplay)
                        $(this).find(".dialogTradeAsset-action-opp").html(actionDisplayOpp)
                        
                        $(this).find("#dialogTradeAsset-actionbalance").data("get_asset", get_asset)
                        $(this).find("#dialogTradeAsset-actionbalance").data("give_asset", give_asset)
                        $(this).find("#dialogTradeAsset-actionbalance").data("get_asset_divisible", get_asset_divisible)
                        $(this).find("#dialogTradeAsset-actionbalance").data("give_asset_divisible", give_asset_divisible)

                        
                        $(this).find("#dialogTradeAsset-actionBalance").html(give_asset_qty)
                        
                        if(action == "BUY"){
                            
                            $(this).find("#dialogTradeAsset-actionAsset").html(decodeURIComponent(action_asset_alias))
                                                
                            $(this).find(".dialogTradeAsset-asset").html(get_asset)
                            $(this).find(".dialogTradeAsset-coin").html(give_asset)
                            
//                            $(this).find("#dialogTradeAsset-rateperbuysell").val(price_buy)
                            $(this).find("#dialogTradeAsset-amount").val(get_asset_amount)
                            $(this).find("#dialogTradeAsset-amount-opp").val(give_asset_amount)
                            
                        }
                        
                        if(action == "SELL"){
                           
                            $(this).find("#dialogTradeAsset-actionAsset").html(decodeURIComponent(action_asset_alias))
                            
                            $(this).find(".dialogTradeAsset-asset").html(give_asset)
                            $(this).find(".dialogTradeAsset-coin").html(get_asset)
                            
//                            $(this).find("#dialogTradeAsset-rateperbuysell").val(price_sell)
                            $(this).find("#dialogTradeAsset-amount").val(give_asset_amount)
                            $(this).find("#dialogTradeAsset-amount-opp").val(get_asset_amount)
                        }

                        $(this).find(".dialog-transfee").html(fee)
                        $(this).find('.dialog-txfeebutton').html(txfeebutton)

                     })   

                    return $message

                },
            buttons: [
                {
                    id: "btn-previewOrder",
                    label: 'Preview Order',
                    cssClass: 'btn-info',
                    action: function(dialogItself) {
                        
                        if(action == "BUY"){ 
                            var asset_divisible = $("#dialogTradeAsset-balance").data("get_asset_divisible")
                            var coin_divisible = $("#dialogTradeAsset-balance").data("give_asset_divisible")
                            var asset_name = get_asset
                            var coin_name = give_asset
                            
                        }
                        if(action == "SELL"){ 
                            var asset_divisible = $("#dialogTradeAsset-balance").data("give_asset_divisible")
                            var coin_divisible = $("#dialogTradeAsset-balance").data("get_asset_divisible")
                            var asset_name = give_asset
                            var coin_name = get_asset
                        }
                        
                        var asset_amount = $("#dialogTradeAsset-amount").val()
                        var coin_amount = $("#dialogTradeAsset-amount-opp").val()
                        
                        if(action == "BUY"){
                            var rate = parseFloat(give_asset_amount / get_asset_amount).toFixed(8)
                        } else {
                            var rate = parseFloat(get_asset_amount / give_asset_amount).toFixed(8)
                        }
                          
//                        if (isNaN(asset_amount) == true || isNaN(coin_amount) == true || asset_amount <= 0 || coin_amount <= 0 || $.isNumeric(asset_amount) || $.isNumeric(coin_amount)) {
//                            //Invalid Amounts
//                            dialogItself.getModalBody().find('#dialogTradeAsset-header').html("Invalid amounts.")
//                        } else {                     
                            
                            //getAssetBalance(address, asset, function(give_asset_balance){
                                
                               // if(give_asset_balance == give_asset_amount){
                            
                                        //previewTradeModal(action, asset_name, asset_amount, asset_divisible, coin_name, coin_amount, coin_divisible)   
                            
                            console.log("preview trade modal...")
                                
                                //}
                     
                            //})

                       // }

                    } 
                },
                {
                    id: "btn-closeOrder",
                    label: 'Close',
                    cssClass: 'btn-default',
                    action: function(dialogItself){
                        
                        if($("body").data("sendTx") == true){

                            getUnconfirmed($("#body").data("address"), function(data){
                                updateUnconfirmed(data)
                            })

                            $("body").data("sendTx", false)

                            BootstrapDialog.closeAll()

                        }
                        dialogItself.close()
                               
                    }   
                }
            ]
        })

   
        tradeAssetDialog.open()  
  
    })
}


function previewTradeModal(action, asset, asset_amount, asset_divisible, coin_type, coin_amount, coin_divisible) {
    var currentaddr = $("#body").data("address")

    var previewTradeModalDialog = new BootstrapDialog({
        title: asset+" Order",
        cssClass: "modal-nofade",
        message: "Are you sure you want to place an order to "+action+" "+asset_amount+" "+asset+" for "+coin_amount+" "+coin_type+"?",
        buttons: [
            {
                id: "btn-placeOrder",
                label: 'Place Order',
                cssClass: 'btn-success',
                action: function(dialogItself) {
                    
                    previewTradeModalDialog.close() 
                    
                    if(action == "BUY"){
                        var sell_asset = coin_type
                        //div = 1 or 0
                        var sell_asset_div = coin_divisible
                        var sell_qty = coin_amount
                        
                        var buy_asset = asset
                        var buy_asset_div = asset_divisible
                        var buy_qty = asset_amount
                    }
                    
                    if(action == "SELL"){
                        var sell_asset = asset
                        //div = 1 or 0
                        var sell_asset_div = asset_divisible
                        var sell_qty = asset_amount
                        
                        var buy_asset = coin_type
                        var buy_asset_div = coin_divisible
                        var buy_qty = coin_amount
                    }
                    
                    
                    var expiration = 6000
                    
                    
                    var transfee = (parseFloat($("#body").data("fee_btc")) * 100000000)/100000000
                    var passphrase = $("#body").data("passphrase")
                    
                    console.log(transfee)
                    
                    
                    $('#dialogTradeAsset-container').html("<div style='padding: 20px 0 20px 0;' align='center'><i class='fa fa-spinner fa-spin fa-3x fa-fw'></i><span class='sr-only'>Loading...</span></div>")
                    
                    
                    $("#btn-previewOrder").addClass("hide")
                    
                    console.log(sell_asset_div)
                    console.log(buy_asset_div)
          
                    createOrder_opreturn_test(currentaddr, sell_asset, sell_asset_div, sell_qty, buy_asset, buy_asset_div, buy_qty, expiration, transfee, passphrase, function(signedtx){
                        sendRawSignedTx(signedtx, function(status, txid){
                            if (status == "success") {
                                
                                $('#dialogTradeAsset-container').html("<div align='center'><div style='padding: 15px 0 15px 0; font-weight: bold; font-size: 18px;'>Transaction Sent!</div><i class='fa fa-check fa-3x' aria-hidden='true'></i></div><div style='padding: 15px 0 15px 0;' align='center'><a href='https://xchain.io/tx/"+txid+"' target='_blank'>View your Transaction</a></div>")  
                                
                                $("body").data("sendTx", true)
                            } else {
                                dialogItself.getModalBody().find('#dialogTradeAsset-container').html("Error")
                            }   
                        }) 
                        
                    }) 
                    
                } 
            },
            {
                id: "btn-closeOrder",
                label: 'Close',
                cssClass: 'btn-default',
                action: function(dialogItself) {
                    
                    previewTradeModalDialog.close()   

                } 
            }
        ]
    })

    previewTradeModalDialog.open()    
}


