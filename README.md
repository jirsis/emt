# EMT MagicMirror² module
This module show estimate time arrive for bus lines EMT (Madrid Buses) in [MagicMirror²](https://github.com/MichMich/MagicMirror/).
All you need to use this module is register yourself into EMT opendata platform with this [form](http://opendata.emtmadrid.es/Formulario).


## EMT Module Screenshot

![emt screenshot](https://github.com/jirsis/emt/raw/master/emt-screenshot.png "EMT screenshot module")
![emt screenshot destination](https://github.com/jirsis/emt/raw/master/emt-screenshot-destination.png "EMT screenshot module with destination enable-destination")


## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
modules: [
	{
		module: "emt",
		position: "top_left",	// This can be any of the regions. Best results in left or right regions.
		config: {
            // The config property is optional.
			// If no config is set, an example emt is shown.
            // See 'Configuration options' for more information.
            // Only mandatory configuration are the credential to retrive the information.
		}
	}
]
````

## Configuration options

The following properties can be configured:

| Option                       | Description
| ---------------------------- | -----------
| `busStops      `             | List to query about all lines defined. <br><br> **Possible values:** `[integer value, integer value, …]` or `single-value` <br> **Default value:** `5511`

#### EMT authentication options:
| Option                | Description
| --------------------- | -----------
| `idClient`            | Id client provied for EMT open-data platform. <br><br> **Default value:** `""`
| `passKey`             | Passkey provided for EMT open-data platform. <br><br>  **Default value:** `""`


#### EMT GUI options:
| Option                | Description
| --------------------- | -----------
| `fade`                | Enable to fade the table information detail. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `true`
| `fadePoint`           |  Item in the table to fade start. <br><br> **Possible values:** float values in  `[0, 1]` <br> **Default value:** `0.25`
| `warningTime`         | Minutes estimated to arrive the bus, and visual alarm. <br><br> **Possible values:** integer value in `[0, 20]` <br> **Default value:** `5`
| `colored`             | Enable colored warning alert. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `true`
| `updateInterval`      | Time between requests EMT platform in miliseconds. <br><br> **Possible values:** any integer <br> **Default value:** `60 * 1000`
| `showDestination`     | Show the bus destination. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `true`

