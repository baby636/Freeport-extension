function create_order_data(sell_asset, sell_qty, buy_asset, buy_qty, expiration, callback){
    
    var prefix = "434e5452505254590000000a"; //CNTRPRTY + transaction id (10)

    var sell_asset_id = assetid(sell_asset); 
    var buy_asset_id = assetid(buy_asset); 
    
    var sell_asset_id_hex = padprefix(sell_asset_id, 16);
    var buy_asset_id_hex = padprefix(buy_asset_id, 16);
    
    if(expiration > 0 && expiration < 65535) {
        var expiration_hex = padprefix(parseInt(expiration).toString(16),4);
    } else {
        //default to 1000 blocks if out of allowable range
        var expiration_hex = padprefix((1000).toString(16),4);
    }
    
    var sell_qty_hex = padprefix((parseInt(sell_qty)).toString(16), 16);
    var buy_qty_hex = padprefix((parseInt(buy_qty)).toString(16), 16);
    
    console.log("sell_asset: "+sell_asset_id_hex)
    console.log("sell_qty: "+sell_qty_hex)
    console.log("buy_asset: "+buy_asset_id_hex)
    console.log("buy_qty: "+buy_qty_hex)
    console.log("expiration: "+expiration_hex)

    var data = prefix + sell_asset_id_hex + sell_qty_hex + buy_asset_id_hex + buy_qty_hex + expiration_hex + "0000000000000000";

    console.log(data)

    callback(data);
            
}


function createOrder_opreturn(add_from, sell_asset, sell_asset_div, sell_qty, buy_asset, buy_asset_div, buy_qty, expiration, transfee, mnemonic, callback) {
    
    console.log(sell_qty)
    
    if(sell_asset_div == 1 || sell_asset_div == "yes" ){
        sell_qty = Math.round(sell_qty * 100000000);
        console.log(sell_qty)
    } else {
        sell_qty = parseInt(sell_qty);   
    }
    
    
    if(buy_asset_div == 1 || buy_asset_div == "yes" ){
        buy_qty = Math.round(buy_qty * 100000000);
    } else {
        buy_qty = parseInt(buy_qty);
    } 
    console.log(buy_qty)     
    
    
    getutxos(add_from, mnemonic, transfee, function(total_utxo, satoshi_change){ 
        
        create_order_data(sell_asset, sell_qty, buy_asset, buy_qty, expiration, function(datachunk_unencoded){
        
            var utxo_key = total_utxo[0].txid
            var datachunk_encoded = xcp_rc4(utxo_key, datachunk_unencoded);

            var bytelength = datachunk_encoded.length / 2;

            var scriptstring = "OP_RETURN "+bytelength+" 0x"+datachunk_encoded;      
            console.log(scriptstring);

            var data_script = new bitcore.Script(scriptstring);
            //var transaction = new bitcore.Transaction();
            
            var feeSatoshis = transfee * 100000000
            console.log(feeSatoshis)
            
            var transaction = new bitcore.Transaction().fee(feeSatoshis);

            for (i = 0; i < total_utxo.length; i++) {
                transaction.from(total_utxo[i]);     
            }

            console.log(total_utxo);

            var xcpdata_opreturn = new bitcore.Transaction.Output({script: data_script, satoshis: 0}); 

            transaction.addOutput(xcpdata_opreturn);

            console.log(satoshi_change);

            if (satoshi_change > 5459) {
                transaction.change(add_from);
            }

            var privkey = getprivkey(add_from, mnemonic) 
            transaction.sign(privkey);

            var final_trans = transaction.uncheckedSerialize();

            console.log(final_trans)
            
            callback(final_trans);
 
        });
    
    });
    
}

function create_btcpay_data(order_txid_0, order_txid_1, callback){
    
    var prefix = "434e5452505254590000000b"; //CNTRPRTY + transaction id (11)

    var data = prefix + order_txid_0 + order_txid_1

    console.log(data)

    callback(data);  
   
}

function btcpay_opreturn(add_from, add_to, sell_qty, order_txid_0, order_txid_1, transfee, mnemonic, callback) {
    
    console.log(order_txid_0)
    console.log(order_txid_1)
    
    var amountremaining = (parseFloat(transfee)+parseFloat(sell_qty))/100000000;
    console.log(amountremaining)
    
    getutxos(add_from, mnemonic, amountremaining, function(total_utxo, satoshi_change){ 
            
        create_btcpay_data(order_txid_0, order_txid_1, function(datachunk_unencoded){
        
            if (datachunk_unencoded != "error") {
                
                var utxo_key = total_utxo[0].txid;
                
                var datachunk_encoded = xcp_rc4(utxo_key, datachunk_unencoded);

                var bytelength = datachunk_encoded.length / 2;
                
                var scriptstring = "OP_RETURN "+bytelength+" 0x"+datachunk_encoded;      
                console.log(scriptstring);
                
                var data_script = new bitcore.Script(scriptstring);
                var transaction = new bitcore.Transaction().fee(transfee);

                for (i = 0; i < total_utxo.length; i++) {
                    transaction.from(total_utxo[i]);     
                }

                console.log(total_utxo);
                
                var btc_total_satoshis = sell_qty;
                transaction.to(add_to, btc_total_satoshis);

                var xcpdata_opreturn = new bitcore.Transaction.Output({script: data_script, satoshis: 0}); 
                transaction.addOutput(xcpdata_opreturn);

                console.log(satoshi_change);

                if (satoshi_change > 5459) {
                    transaction.change(add_from);
                }
      
                var privkey = getprivkey(add_from, mnemonic);
                transaction.sign(privkey);

                var final_trans = transaction.uncheckedSerialize();
             
            } else {

                var final_trans = "error";

            }

            console.log(final_trans);
            
            callback(final_trans);
                      
        });
    
    });
    
}

function cancelOrder_opreturn(add_from, order_txid, transfee, mnemonic, callback) {
    
    getutxos(add_from, mnemonic, transfee, function(total_utxo, satoshi_change){ 
                     
        var utxo_key = total_utxo[0].txid;

        var datachunk_unencoded = "434e54525052545900000046"+order_txid;
        
        console.log(datachunk_unencoded);
        
        if (datachunk_unencoded.length == 88) {

            var datachunk_encoded = xcp_rc4(utxo_key, datachunk_unencoded);

            var bytelength = datachunk_encoded.length / 2;

            var scriptstring = "OP_RETURN "+bytelength+" 0x"+datachunk_encoded;      
            console.log(scriptstring);

            var feeSatoshis = transfee * 100000000
            console.log(feeSatoshis)
            
            var data_script = new bitcore.Script(scriptstring);
            //var transaction = new bitcore.Transaction();
            var transaction = new bitcore.Transaction().fee(feeSatoshis);

            for (i = 0; i < total_utxo.length; i++) {
                transaction.from(total_utxo[i]);     
            }

            console.log(total_utxo);

            var xcpdata_opreturn = new bitcore.Transaction.Output({script: data_script, satoshis: 0}); 

            transaction.addOutput(xcpdata_opreturn);

            console.log(satoshi_change);

            if (satoshi_change > 5459) {
                transaction.change(add_from);
            }
            
            var privkey = getprivkey(add_from, mnemonic);
            transaction.sign(privkey);

            var final_trans = transaction.uncheckedSerialize();

        } else {

            var final_trans = "error";

        }

        console.log(final_trans);
        
        callback(final_trans);


    });
    
}

//order
//FORMAT = '>QQQQHQ'
//LENGTH = 8 + 8 + 8 + 8 + 2 + 8
//ID = 10

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

function create_dispenser_data(give_asset, give_qty, escrow_qty, sats_per_asset, status){
    var prefix = "434e5452505254590000000c"; //CNTRPRTY + transaction id (12)

    var give_asset_id = assetid(give_asset); 
    var give_asset_id_hex = padprefix(give_asset_id, 16);
    
    var give_qty_hex = padprefix((parseInt(give_qty)).toString(16), 16);
    var escrow_qty_hex = padprefix((parseInt(escrow_qty)).toString(16), 16);
    var sats_per_asset_hex = padprefix((parseInt(sats_per_asset)).toString(16), 16);
    
    if(status == "open"){
        status = "00"
    } else {
        status = "0a"
    }
    
    var data = prefix + give_asset_id_hex + give_qty_hex + escrow_qty_hex + sats_per_asset_hex + status

    console.log(data)

    return data
}

function createDispenser_opreturn(add_from, give_asset, give_asset_div, give_qty, escrow_qty, sats_per_asset, status, transfee, mnemonic, callback) {
    
    console.log(give_qty)
    
    if(give_asset_div == 1 || give_asset_div == "yes" ){
        give_qty = Math.round(give_qty * 100000000);
        console.log(give_qty)
    } else {
        give_qty = parseInt(give_qty);   
    }
    
    var amountremaining = (parseFloat(transfee)*100000000)/100000000;
        
    getutxos(add_from, mnemonic, amountremaining, function(total_utxo, satoshi_change){ 
            
        var datachunk_unencoded = create_dispenser_data(give_asset, give_qty, escrow_qty, sats_per_asset, status)
        
        if (datachunk_unencoded != "error") {

            if(total_utxo.length == 0){callback("error")}            

            var datachunk_encoded = xcp_rc4(total_utxo[0].txid, datachunk_unencoded);
            var scriptstring = "OP_RETURN "+datachunk_encoded;
            
            var feeSatoshis = parseInt(transfee * 100000000)

            var tx = new bitcoinjs.TransactionBuilder(NETWORK);   

            //inputs
            for (i = 0; i < total_utxo.length; i++) {  
                tx.addInput(total_utxo[i].txid, total_utxo[i].vout) 
            }
            console.log(total_utxo);

            //outputs             
            tx.addOutput(bitcoinjs.script.fromASM(scriptstring), 0)

            console.log(satoshi_change);
            if (satoshi_change > 5459) {
                tx.addOutput(add_from, satoshi_change)
            }

            var privkey = getprivkey(add_from, mnemonic); 
            var key = bitcoinjs.ECPair.fromWIF(privkey, NETWORK);
            tx.sign(0, key);

            var final_trans = tx.buildIncomplete().toHex();

            callback(final_trans)  //push raw tx to the bitcoin network

        } else {

            var final_trans = "error";

        }

        console.log(final_trans);
        
    });
    
    
}


function createIssuance_opreturn(add_from, assetid, quantity, divisible, description, transfee, mnemonic, callback) {
        
    var amountremaining = (parseFloat(transfee)*100000000)/100000000;
        
    getutxos(add_from, mnemonic, amountremaining, function(total_utxo, satoshi_change){ 
            
        var datachunk_unencoded = create_issuance_data_opreturn(assetid, quantity, divisible, description);
        
        if (datachunk_unencoded != "error") {

            if(total_utxo.length == 0){callback("error")}            

            var datachunk_encoded = xcp_rc4(total_utxo[0].txid, datachunk_unencoded);
            var scriptstring = "OP_RETURN "+datachunk_encoded;
            
            var feeSatoshis = parseInt(transfee * 100000000)

            var tx = new bitcoinjs.TransactionBuilder(NETWORK);   

            //inputs
            for (i = 0; i < total_utxo.length; i++) {  
                tx.addInput(total_utxo[i].txid, total_utxo[i].vout) 
            }
            console.log(total_utxo);

            //outputs             
            tx.addOutput(bitcoinjs.script.fromASM(scriptstring), 0)

            console.log(satoshi_change);
            if (satoshi_change > 5459) {
                tx.addOutput(add_from, satoshi_change)
            }

            var privkey = getprivkey(add_from, mnemonic); 
            var key = bitcoinjs.ECPair.fromWIF(privkey, NETWORK);
            tx.sign(0, key);

            var final_trans = tx.buildIncomplete().toHex();

            callback(final_trans)  //push raw tx to the bitcoin network

        } else {

            var final_trans = "error";

        }

        console.log(final_trans);
        
    });
    
    
}
