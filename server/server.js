import axios from 'axios'

const express = require('express');
const app = express();
const cors = require('cors');
const corsOptions ={
    origin:'*', //allow anybody to access the 8080 server
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
}
app.use(cors(corsOptions)); // Use CORS middleware with the specified options

//bro said this was for our frontend to access our backend
app.get('/againstlab', async(req, res) => {
  try {
    url = 'https://againstlab.com/products.json?limit=10'
    const response = await axios.get(url)
  } catch (error) {
    
  }
});

app.get('/api', (req,res)=>{
    res.json({'fruits': ['apple', 'banana', 'orange']});
})

app.get('/api/shopee', (req, res)=>{
    try {
        const productAPI = 'https://shopee.com.my/api/v4/pdp/get_pc?display_model_id=233315022737&item_id=26513852884&model_selection_logic=3&shop_id=1251008059&tz_offset_in_minutes=480&detail_level=0'
        const headers = {
            'authority' :'shopee.com.my',
            'method':'GET',
            'path' : '/api/v4/pdp/get_pc?display_model_id=233315022737&item_id=26513852884&model_selection_logic=3&shop_id=1251008059&tz_offset_in_minutes=480&detail_level=0',
            'scheme':'https',
            'accept':'application/json',
            'accept-encoding' :'gzip, deflate, br, zstd',
            'accept-language' : 'en-GB,en-US;q=0.9,en;q=0.8',
            'af-ac-enc-dat' :'b0b2ed22314b6046',
            'af-ac-enc-sz-token':'JqNlEho8wBW+2FPG8/6qBQ==|OIVEaUPZr8pKbbnyYj1bgncDF2L0Nbt6CrLBli2rwUkiQzik1yUrKLVQJ/Xp0Eklbt3FTSmrdz1Y6KYGi0o=|eYwvBx9rv1YtFuvm|08|3',
            'content-type':'application/json',
            'cookie' : '_gcl_au=1.1.993291101.1763300601; _gid=GA1.3.1862118098.1763300602; _fbp=fb.2.1763300601986.929182641212380806; SPC_SI=kqb5aAAAAABjNTI4bjRoMWc6FQgAAAAAa2JyZUh3Q2M=; SPC_F=N2wad6je6lnIoiU0UKxKNQlIGdvZzQ5P; REC_T_ID=3a355091-c2f2-11f0-a8b7-ce8c85bd478f; language=en; _ga_YE6LVF7NTK=GS2.1.s1763300601$o1$g1$t1763300719$j58$l0$h0; _gcl_gs=2.1.k1$i1763300723$u56721768; _QPWSDCXHZQA=9da79357-e0e8-433b-f45a-37341c6eb4f6; REC7iLP4Q=80f959e8-ea2c-434a-b221-f3c9b7e742da; SPC_CLIENTID=TjJ3YWQ2amU2bG5Juiysesdqiatlsstk; _gcl_aw=GCL.1763300729.Cj0KCQiAiebIBhDmARIsAE8PGNIiAccof0QFZzN92rgbxj4DTxVaVTR9RUVbdBUTctT6-dTiHOd-w4caAkjEEALw_wcB; _gac_UA-61915055-6=1.1763300729.Cj0KCQiAiebIBhDmARIsAE8PGNIiAccof0QFZzN92rgbxj4DTxVaVTR9RUVbdBUTctT6-dTiHOd-w4caAkjEEALw_wcB; SPC_ST=.MENPUDAyVGdYSlpsSDQwaUFFQ+5vfcGA4P8KNhidcs/mgmM5sG6Gzzwkv2Ajkw4oUZ5f5VnHcXRgA2ENhWSqLmGwg6Kq61+6/5x8+lok2BP/oJ5/mK+CJFKXKeVdl+BKCUklV7pUgM5mIz461ECvHk/xoQIzpwPRxSWRrLKiABYDcxWGsRA07mVqyAyTHlXXCctay8zSurBm8KNBBf5yZqg9wq8Ve+FjmlUZYZdrql3V+q6qwGd/pHteSnQxcyaOsV8OBoALDTDialZwinMxXg==; SPC_U=231045411; SPC_R_T_ID=NsJSTHNS/7iL+YmaJDIA+dMW87sELPCrs2rm16RvlG1mV7lrQ7/tQOcAJJsmrGOOqfud/QG3N7rxN+GH/hOA325pu/khNRDx8Hne7fr0WoLsW2DsF+DhcAxao0HLF3R1OBqZUeAsz8XJLB+iQTRxIQuR6oXIX4Irp92N6tZCLcs=; SPC_R_T_IV=RmdWSzZFSnRBMzZqUFNJZg==; SPC_T_ID=NsJSTHNS/7iL+YmaJDIA+dMW87sELPCrs2rm16RvlG1mV7lrQ7/tQOcAJJsmrGOOqfud/QG3N7rxN+GH/hOA325pu/khNRDx8Hne7fr0WoLsW2DsF+DhcAxao0HLF3R1OBqZUeAsz8XJLB+iQTRxIQuR6oXIX4Irp92N6tZCLcs=; SPC_T_IV=RmdWSzZFSnRBMzZqUFNJZg==; _med=affiliates; SPC_SEC_SI=v1-NWY1R3FmUHpsMGVDcGd1ecDZnYbFIWlu4OMD7PxPXXFNCbzCWXsSHIWyvS3PstdJlhLjHLQI704vbl5d1Oy1hKvUx8pJVxj+cGwUzP1BikM=; csrftoken=1kkOesvehFBQqaCMx4OB9m391g8ayRKT; _sapid=65fee951fa684734a2266f58ff2f5f282311a205d813b13b83dd1a3b; SPC_IA=1; SPC_CDS_CHAT=1e7a98f1-7924-4ac7-87b1-b3e73766118d; _ga=GA1.1.66704004.1763300602; _ga_NEYMG30JL4=GS2.1.s1763461508$o5$g0$t1763461508$j60$l1$h1856395450; shopee_webUnique_ccd=JqNlEho8wBW%2B2FPG8%2F6qBQ%3D%3D%7COIVEaUPZr8pKbbnyYj1bgncDF2L0Nbt6CrLBli2rwUkiQzik1yUrKLVQJ%2FXp0Eklbt3FTSmrdz1Y6KYGi0o%3D%7CeYwvBx9rv1YtFuvm%7C08%7C3; ds=cfe0bac823ccef0c49dba9f5f678d56b; SPC_EC=.RWw5OWVHNlpmSXZYZWZLbAwhNLhSqNPRl5JwMXuW2RVmZfbWODioUwiv8+n3JMAM+poKPZlDx/Nari+VEmjUEkFvpyu9kGCKpgoDPCqow8XBJq6GXF7nef+vkPvTfg8aNoR8KpJq8uhUlIPAvKlLYoB/JcsW6WTkGdqLAT+bhDb5sN2GBbDcCwVigxRDvU9ZPHx8JPXDs7AOXW7trAFbGtjEXWhqJAgi8l4R4mKFAxXH7UApjD8dwP5Vb04ACR5FEs6m409eQpFAuoYGBYVt4A==',
            'd-nonptcha-sync':'AAAG4xuCDjgA|7|1pD17pLPBXSVI=',
            'priority':'u=1, i',
            'referer':'https://shopee.com.my/BAGSMART-Laptop-Backpack-15.6-Inch-Lightweight-Waterproof-Large-Casual-Daypack-College-Schoolbag-i.1251008059.26513852884?extraParams=%7B%22display_model_id%22%3A233315022737%2C%22model_selection_logic%22%3A3%7D&sp_atk=041dac43-3359-46b0-b488-351bb45acb10&xptdk=041dac43-3359-46b0-b488-351bb45acb10',
            'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
            'sec-ch-ua-mobile':'?0',
            'sec-ch-ua-platform': "Windows",
            'sec-fetch-dest' : 'empty',
            'sec-fetch-mode':'cors',
            'sec-fetch-site':'same-origin',
            'sz-token':'JqNlEho8wBW+2FPG8/6qBQ==|OIVEaUPZr8pKbbnyYj1bgncDF2L0Nbt6CrLBli2rwUkiQzik1yUrKLVQJ/Xp0Eklbt3FTSmrdz1Y6KYGi0o=|eYwvBx9rv1YtFuvm|08|3',
            'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
            'x-api-source':'pc',
            'x-csrftoken':'1kkOesvehFBQqaCMx4OB9m391g8ayRKT',
            'x-requested-with':'XMLHttpRequest',
            'x-sap-ri':'84491c692f5f25cdf3829f3f07010ce496a021afc5defd700408',
            // 'x-sap-sec' : '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'
            'x-shopee-language':'en',
            'x-sz-sdk-version':'1.12.24'
        }
    } catch (error) {
        
    }
})

app.listen(8080, ()=>{
    console.log('Server is running on port 8080');
})