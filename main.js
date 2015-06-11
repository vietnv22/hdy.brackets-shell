/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true,
         indent: 4, maxerr: 50 */
/*global define, $, brackets */

define(function (require, exports, module) {
    "use strict";

    var AppInit            = brackets.getModule("utils/AppInit"),
        ExtensionUtils     = brackets.getModule("utils/ExtensionUtils"),
        ProjectManager     = brackets.getModule("project/ProjectManager"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        Preferences        = PreferencesManager.getExtensionPrefs("hdy.brackets-shell"),
        $icon               = $("<a class='hdy-shell-icon' href='#'> </a>")
                                .attr("title", "Shell")
                                .appendTo($("#main-toolbar .buttons")),
		Menus = brackets.getModule( 'command/Menus' ),
		CommandManager = brackets.getModule( 'command/CommandManager' ),
		Commands = brackets.getModule( 'command/Commands' ),
	
		// Extension basics.
		COMMAND_ID = 'hdy.brackets-shell.enable',
		
		// Get view menu.
		menu = Menus.getMenu( Menus.AppMenuBar.VIEW_MENU );
	
	// Register extension.
	CommandManager.register( "BracketsShell", COMMAND_ID, toggleShell );
	
	// Add command to menu.
	if ( menu !== undefined ) {
		menu.addMenuDivider();
		menu.addMenuItem( COMMAND_ID, 'Ctrl-Alt-Shift-T' );
	}
	
    // Default theme if not defined
    if(Preferences.get("dark") === undefined) {
        Preferences.definePreference("dark", "boolean", false);
        Preferences.set("dark", false);
        Preferences.save();
    }

    // Default projectTracking if not defined
    if(Preferences.get("trackProject") === undefined) {
        Preferences.definePreference("trackProject", "boolean", true);
        Preferences.set("trackProject", true);
        Preferences.save();
    }

    if(Preferences.get("shell") === undefined) {
        Preferences.definePreference("shell", "string", "cmd.exe");
        if (brackets.platform === "win") {
            Preferences.set("shell", "cmd.exe");
        } else {
            Preferences.set("shell", "/bin/sh");
        }
        Preferences.save();
    }
	
	function toggleShell() {
		var commandShell    = require("shellPanel");
		commandShell.toggle();
	}

    AppInit.appReady(function () {

        var projectWatcher  = require("projectWatcher"),
            commandShell    = require("shellPanel");

        require('./online').init();

        ExtensionUtils.loadStyleSheet(module, "styles/shellPanel.css");
        $icon.on("click", toggleShell);

        commandShell.hide();
        commandShell.setDirectory(projectWatcher.cleanPath(ProjectManager.getProjectRoot().fullPath));

        if (Preferences.get("trackProject")) {
            projectWatcher.register(function(cwd) {
                if (cwd) {
                    commandShell.setDirectory(cwd);
                }
            });
        }

        projectWatcher.watch();

    });

});
