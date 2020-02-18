function getBrowser() {
  if (typeof chrome !== "undefined") {
    if (typeof browser !== "undefined") {
      return browser;
    } else {
      return chrome;
    }
  } 
}

var thisBrowser = getBrowser()

if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};

$( document ).ready(function() { 
    
    var initValues = $( "#menubar-vm" ).data("initial-values");    
    var isFan = initValues.is_fan_page

    if(isFan){
        var fanUrl = initValues.fan_url
        var pagePath = initValues.page_path
        
        var currentUser = pagePath.split('/').last()
        var currentOwner = fanUrl.split('/').last()
        console.log(currentUser)
        console.log(currentOwner)
        
        if(currentUser == currentOwner){
            
            chrome.storage.sync.get(['address'], function(items) {
                console.log(items.address)
            });
            
            
            $( "div.fan-bio-inner div.blurb div.blurb-text" ).each(function() { 
                var blurbText = $(this).html()
                var fanAddress = blurbText.split("Freeport:").last().replace(/\s/g,'')
                
                
                console.log(fanAddress)
            })
             
            
        }
    }
    
    
    
    
//    var buttonpath = chrome.extension.getURL('../images/icon-48.png');   
//    $("thead>tr").prepend("<th scope='col'><img src='"+buttonpath+"' height='16' width='16'></div></th>")
//    
//    $( "tr.order-data" ).each(function() {   
//        var matchQuantityAsset = $(this).data("match-quantity-asset")
//        var matchPrice = $(this).data("match-price")
//        var matchPriceAsset = $(this).data("match-price-asset")
//        
//        if($(this).children( "td:nth-child(1)" ).hasClass("text-success")){   
//            $(this).children( "td:nth-child(1)" ).before('<td><div style="margin:-20px 0 -20px 0;"><button class="btn btn-danger btn-block my-2 freeport-sellAsset" style="padding: 4px;top: 7px; position: relative;" data-match-quantity-asset="'+matchQuantityAsset+'" data-match-price="'+matchPrice+'" data-match-price-asset="'+matchPriceAsset+'"><div style="display: inline-block;">Sell '+matchQuantityAsset+'</div></button></div></td>')
//        }
//        
//        if($(this).children( "td:nth-child(1)" ).hasClass("text-danger")){ 
//            $(this).children( "td:nth-child(1)" ).before('<td><div style="margin:-20px 0 -20px 0;"><button class="btn btn-success btn-block my-2 freeport-buyAsset" style="padding: 4px 10px 4px 10px;top: 7px; position: relative;" data-match-quantity-asset="'+matchQuantityAsset+'" data-match-price="'+matchPrice+'" data-match-price-asset="'+matchPriceAsset+'"><div style="display: inline-block;">Buy '+matchQuantityAsset+'</div></button></div></td>')   
//        }
//    });
//    
//    $(".freeport-buyAsset").on('click', function(){
//        var matchQuantityAsset = $(this).data("match-quantity-asset")
//        var matchPrice = $(this).data("match-price")
//        var matchPriceAsset = $(this).data("match-price-asset")
//        
//        console.log(matchQuantityAsset)
//    })
//    
//    $(".freeport-sellAsset").on('click', function(){
//        var matchQuantityAsset = $(this).data("match-quantity-asset")
//        var matchPrice = $(this).data("match-price")
//        var matchPriceAsset = $(this).data("match-price-asset")
//        
//        console.log(matchQuantityAsset)
//    })
})