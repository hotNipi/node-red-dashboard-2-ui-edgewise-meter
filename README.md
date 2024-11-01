# node-red-dashboard-2-ui-edgewise-meter

A linear style gauge for Node-RED Dashboard 2.0.

![Node-RED gauge edgewise meter image](https://github.com/user-attachments/assets/ffe6d78d-d4e7-47e4-9145-3930433b0d2a)




## Install

The usual method of installing is to use Manage Palette in the node red editor and search for @hotnipi/node-red-dashboard-2-ui-edgewise-meter and install it.

Using `npm` directly, `cd` into your node red user directory (usually .node-red in your home folder) and from there run
```
npm install @hotnipi/node-red-dashboard-2-ui-edgewise-meter
```

## Inputs

Pass the value in `msg.payload`.  This may be a Number or a string that represents a number.

Certain configuration values can be overridden dynamically be passing in an object in `msg.ui_update`.  See Dynamic Properties below.

## Configuration

* **Name** - The name of the node.
* **Group** - The display group in which to show the gauge.
* **Size** - The size of the gauge on the dashboard.
* **Label** - A text label that is shown above the gauge's display.
* **Limits Min and Max** - These specify the range of the gauge. Values are mandatory.
* **Digits** - This defines count of the digits on gauge display. Note that not every combination of Min, Max and Digits count can satisfy even spreading of the digits. Change any of those to get positive result. The Alternate sizes option makes every second digit smaller.
* **Display size** - The display size affects gap between digits. If size is too small, the digits can't be rendered to the correct positions and the display shows error on runtime.
* **Sectors** - This defines a set of coloured sectors.  Each row defines the start value of the sector and the colour to be used.  The sectors must be defined in increasing start value order, so the colour defined in one row applies up to the value defined in the next row, or the end of the scale if it is the last one. To make a gap between colored sections define the sector to be transparent by ticking the transparent option.
* **Exact value** - Mini display with actual value can be shown above main display. Choose to show it on mouse hover or permanently visble or to not show at all.
* **Unit** - The unit of the measurement can be shown inside the mini display. Unit can be any string. 
* **Appearance** - The Mini display has two size options and several placement options. Follow the pictogram to choose the sizing and placement.
* **Animation** - The main display moves in x-axis. Choose animation type or turn off aminations completely.
* **Dark mode** - The appearance of the display can be adjusted based on background of the group. Use dark mode if you have dark group background.
* **Logo** - Small print on the display can be changed to any string.
* **Class** - A CSS Class that will be applied to the gauge to allow override of display element style.

## Dynamic Properties

Certain properties can be overridden by passing an object in `msg.ui_update`.  The name of the item in `msg.ui_update` is generally the name of the propety being overridden.  For example, the Sectors definitions may be changed by passing in array in `msg.ui_update.sectors`.  

* **Label** - If `msg.ui_update.label` is present and contains a string then that string will be displayed in the label field in the gauge.
* **Min** - If `msg.ui_update.min` is present and contains a number then min limit of the gauge will be changed.
* **Max** - If `msg.ui_update.max` is present and contains a number then max limit of the gauge will be changed.
* **Count** - If `msg.ui_update.count` is present and contains a number then count of the digits of the gauge will be changed. The display recalculates positions so you may need to change also the Min or Max to get correct results  
* **Display size** - If `msg.ui_update.displaysize` is present and contains a number then display size will be changed.
* **Sectors** - If `msg.ui_update.sectors` contains an array then that will be used to override the current sector data.  The array must contain properties containing the sector start value and the colour.  It must be in order of increasing start value.  For example, the array might consist of
`[{ "start": 0, "color": "green"}, { "start": 5, "color": "skyblue"}]`



## CSS overrides

Display elements my be overriden in the normal way using a ui-template node.  In particular:

**The color of the digits**  
```
.myclass .hotnipi-ewm-num{
    color:red !important ;
}
```
