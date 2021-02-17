/*
##########################################################################
*
*   Copyright © 2019-2020 Akashdeep Dhar <t0xic0der@fedoraproject.org>
*
*   This program is free software: you can redistribute it and/or modify
*   it under the terms of the GNU General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.
*
*   This program is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU General Public License for more details.
*
*   You should have received a copy of the GNU General Public License
*   along with this program.  If not, see <https://www.gnu.org/licenses/>.
*
##########################################################################
*/

package main

import (
    "flag"
    "fmt"
    "net/http"
)

func FR_RED(textobjc string) string {
	return "\u001b[31m" + textobjc + "\u001b[0m"
}

func FR_BLUE(textobjc string) string {
	return "\u001b[34m" + textobjc + "\u001b[0m"
}

func FR_MAGENTA(textobjc string) string {
    return "\u001b[35m" + textobjc + "\u001b[0m"
}

func TX_BOLD(textobjc string) string {
    return "\u001b[1m" + textobjc + "\u001b[0m"
}

func GN_TEXT(textobjc string) string {
	return "      " + textobjc
}

func MainTemplateLoads (wrt http.ResponseWriter, req *http.Request) {
    wrt.Header().Set("Content-Type", "text/html")
    http.ServeFile(wrt, req, "templates/maingotm.html")
}

func ServeWebInterface (portdata string) {
    fmt.Printf(FR_BLUE(TX_BOLD("[ ✓ ] SuperVisor WEB v0.2.0")) + "\n" +
               GN_TEXT("Starting web interface at port number " + portdata) + "\n" +
               GN_TEXT("Press Ctrl+C to exit") + "\n")
    static := http.FileServer(http.Dir("./static"))
    http.HandleFunc("/", MainTemplateLoads)
    http.Handle("/static/", http.StripPrefix("/static/", static))
    var eror error = http.ListenAndServe(":" + portdata, nil)
    if eror != nil {
        fmt.Printf(FR_RED(TX_BOLD("[ ! ] " + eror.Error())) + "\n")
    }
}

func ShowAboutInterface () {
    fmt.Printf(FR_BLUE(TX_BOLD("[ ✓ ] SuperVisor WEB v0.2.0")) + "\n" +
               GN_TEXT("© 2019-2020 Akashdeep Dhar <t0xic0der@fedoraproject.org>") + "\n" + "\n" +
               FR_BLUE(TX_BOLD("[ i ] About")) + "\n" +
               GN_TEXT("An intuitive remotely-accessible system performance ") + "\n" +
               GN_TEXT("monitoring and task management tool for servers and ") + "\n" +
               GN_TEXT("headless Raspberry Pi setups") + "\n" + "\n" +
               FR_BLUE(TX_BOLD("[ i ] Usage")) + "\n" +
               GN_TEXT(FR_MAGENTA("-port") + "        - " + "Set the port value [0-65536]") + "\n" +
               GN_TEXT(FR_MAGENTA("-help") + "        - " + "Read about the scriptlet and its creators") + "\n" + "\n" +
               FR_BLUE(TX_BOLD("[ i ] Maintainers")) + "\n" +
               GN_TEXT(FR_MAGENTA("t0xic0der") + "    - " + "Akashdeep Dhar") + "\n" +
               GN_TEXT(FR_MAGENTA("shivangswain") + " - " + "Shivang Swain") + "\n")
}

func main() {
	var port string
	var help bool
	flag.StringVar(&port, "port", "9696", "Set the port value [0-65536]")
	flag.BoolVar(&help, "help", false, "Read about the scriptlet and its creators")
	flag.Parse()
	if help == true {
	    ShowAboutInterface()
	} else {
	    ServeWebInterface(port)
	}
}