# Sensors_IO

Sensor_IO is global-sensor-network-like web application built with ExpressJS and it
is completely based on JSON objects and API requests.

You can easily define virtual sensors (a.k.a data sources) starting from the sample file contained in source files. 
Every source has an <strong>origin</strong> and a <strong>parser</strong>.
<ul>
    <li>An origin fetch data from a remote/local location</li>
    <li>A parser take the data from the origin and trasform it in a JSON object</li>
</ul>

You can also write your own origins/parsers for your needs. You only have to follow the protocol already defined in preloaded components.

At the moment only CSV parser is available.
At the moment the following origins are available:
<ul>
    <li>FTP</li>
    <li>HTTP</li>
</ul>


# Tasks
You can set up automated tasks that are loaded from the default task folder, specifying task code and execution interval.

