# csgo-supply-unit-automation
Repository for automatically updating storage units in csgo

Notes (seeing that this has been starred a few times and I uploaded this without documentation just for myself): 

In `index.js`,
`add_to_casket()` will add any items that satisify 
1. untradeable `currentTime < new Date(item['tradable_after']).getTime()`
2. a file called `purchase_data` includes the paintwear of the item `purchase_data.includes(item['paint_wear'])`
3. item is not already in a storage unit `!item.hasOwnProperty('casket_id')`
to the configured storage unit. 

`remove_from_casket()` will remove any items that satisify
1. tradeable `currentTime > new Date(item['tradable_after']).getTime()`

Additionally, this doesn't seem to be specifically defined in the committed version of `index.js`, but the GC will allow you to move around 50 items/s either in or out of storage units, so to avoid spamming the GC, use a 1000 ms delay between each 50 add/remove requests. 
