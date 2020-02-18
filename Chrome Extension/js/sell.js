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