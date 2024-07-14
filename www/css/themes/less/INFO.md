![](../../../svg/brand.svg)

# Custom theme instructions

Prerequisites:
### Install LESS through npm: `npm i -g less`, *-g* is the global flag, meaning you'll get a system install instead of a project dependancy.

Creating a theme:
1. Create a new directory under www/css/themes/less, and create 2 files:
   - {your-theme-here}.less
   - variables.less

2. Edit *variables.less* to include any base colors to be used for buttons, body, navbar, etc...

3. Edit *{your-theme-here}.less* to have 2 lines at the top:
   
   `@import "../bootstrap-3.3.1/less/bootstrap.less";
   @import "./variables.less";`

   Below the @imports add/edit any fonts, classes, IDs, etc, for example:

    `#rightpane-inner {
      margin-left: 0;
      margin-right: 0;
    }`   

4. Once done customizing, compile with the following command:   
   `lessc ./{your-theme-here}.less ./{path for your output file}/output.css`
---
<font style="color:orange; font-size: 18px">
<h3>HEADS UP!:</h3> 
Making any changes to your theme's less file will require you run less again, <b>Don't</b> add any edits to the resulting <span style="font-style: italic">"theme.css"</span>, as they will be overwritten when <span style="text-decoration: underline">lessc</span> is run.
</font>
