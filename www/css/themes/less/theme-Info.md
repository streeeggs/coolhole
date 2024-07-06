# Creating a theme for Bootstrap 3

## Methods:
### Route 1: LESS
1. Using a local (global) install of Less makes things easier, but requires downloading Bootstrap v3.3.1 source from here
    > LESS install through npm: `npm i -g less`, *-g* is the global flag, meaning you'll get a system install instead of a project dependancy
    > https://blog.getbootstrap.com/2014/11/12/bootstrap-3-3-1-released/ Source files available from their blogpost, or from the official Bootstrap github repository:
    > https://github.com/twbs/bootstrap/releases/tag/v3.3.1
2. Once downloaded edit the theme.less file to point towards **"Bootstrap.less"** from the downloaded source files, e.g: *"../Bootstrap 3.3.1/less/Bootsrap.less"*
3. Edit *variables.less* to include any base colors to be used for buttons, body, navbar, etc...
4. Once done customizing, compile with the following command:
   > lessc ./{path to your less input file}/input.less ./{path for your output file}/output.css
<font style="color:red">
### WARNING: 
#### Recompiling will wipe any CSS added to the Output file, if you want to preserve those changes, add them to your input file (theme.less),make changes to "variables.less", then re-compile.
</font>
### Route 2: Online Generator
> Avoid a global LESS install by using an online tool such as:
> https://www.bootstrap-live-customizer.com, to generate a minified bootstrap file for you.
1. Customize the included *variables.less* file.
2. Upload the less file to your chosen theme generator.
3. Download generated CSS file (minified or unminified).
4. Optional: Rename and place the file in the */themes* folder for use.