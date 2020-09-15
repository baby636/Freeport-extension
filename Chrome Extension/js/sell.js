//dispenser
//FORMAT = '>QQQQB'
//LENGTH = 33
//ID = 12
//DISPENSE_ID = 13


//data = message_type.pack(ID)
//data += struct.pack(FORMAT, assetid, give_quantity, escrow_quantity, mainchainrate, status)


//434e545250525459 - CNTRPRTY
//0c - ID (12)
//000001343609f4ea - Asset ID (GIVEKUDOS)
//0000000000002328 - Give qty (9000)
//0000000000002328 - Escrow qty (9000)
//00000000000f4240 - Rate per unit in satoshis (1000000)
//00 - status (open)


function sellAssetModal(asset_image, asset_alias, asset, asset_divisible, asset_qty, fee){
      
     feeRecommendedCallback2(function(fee_recommended_priority, fee_recommended_economy){
        
        var txfeebutton = addFeeButtons(fee_recommended_priority, fee_recommended_economy)  

        var asset_amount, price_satoshis, sell_qty, actionDisplay
      
        if(asset_divisible){
            asset_amount = parseFloat(asset_qty)
        } else {
            asset_amount = parseInt(asset_qty)
        }
             
        var sellAssetDialog = new BootstrapDialog({
            title: "Sell Asset",
            id: "sellAssetModal",
            cssClass: "modal-nofade sellModalEvent",
            message: function(dialog){
   
                    //dialog.getButton('btn-previewSell').disable()

                    //tradeAssetDialog.setClosable(false)

                    var $message = $('<div></div>').load('modal/dialog-sell-asset.html', function(){
                        
                        var assetImageHtml = "<img src='"+asset_image+"' width='240px'>"
                        $(this).find("#dialogSellAsset-image").html(assetImageHtml)
                        $(this).find(".dialogSellAsset-alias").html(decodeURIComponent(asset_alias))
                        $(this).find(".dialogSellAsset-asset").html(asset)
                        $(this).find("#dialogSellAsset-balance").html(asset_qty)
                   
                        $(this).find("#dialogSellAsset-container").data("asset", asset)
                        $(this).find("#dialogSellAsset-container").data("asset_divisible", asset_divisible)

                        $(this).find(".dialog-transfee").html(fee)
                        $(this).find('.dialog-txfeebutton').html(txfeebutton)

                     })   

                    return $message

                },
            buttons: [
                {
                    id: "btn-previewSell",
                    label: 'Preview',
                    cssClass: 'btn-info',
                    action: function(dialogItself) {
                        
                        var asset_divisible = $("#dialogSellAsset-container").data("asset_divisible")
                        var asset = $("#dialogSellAsset-container").data("asset")
                          
                        
                        var asset_amount = $("#dialogSellAsset-amount").val()
                        var price_satoshis = $("#dialogSellAsset-price").val()
                        
                       
                          
//                        if (isNaN(asset_amount) == true || isNaN(coin_amount) == true || asset_amount <= 0 || coin_amount <= 0 || $.isNumeric(asset_amount) || $.isNumeric(coin_amount)) {
//                            //Invalid Amounts
//                            dialogItself.getModalBody().find('#dialogSellAsset-header').html("Invalid amounts.")
//                        } else {                     
                            
                            //getAssetBalance(address, asset, function(give_asset_balance){
                                
                               // if(give_asset_balance == give_asset_amount){
                            
                                        //previewTradeModal(action, asset_name, asset_amount, asset_divisible, coin_name, coin_amount, coin_divisible)   
                            
                            console.log("preview sell modal...")
                                
                                //}
                     
                            //})

                       // }

                    } 
                },
                {
                    id: "btn-closeSell",
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

   
        sellAssetDialog.open()  
  
    })
}