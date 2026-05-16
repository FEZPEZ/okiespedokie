import { render } from "./render.js";

/*
Animation format:

animationName: {
    margin: {
        top,
        left
    },

    frames: [
        {
            hold,
            margin: {
                top,
                left
            },

            content
        }
    ]
}
*/

export const animations = {

    eat: {

        margin: {
            top: 2,
            left: 8
        },

        frames: [

            {
                hold: 2180,

                margin: {
                    top: 0,
                    left: 0
                },

                content: [
                    "                        ",
                    "██████            ██████",
                    "                        ",
                    "█                      █",
                    "████████████████████████",
                    "█                      █"
                ].join("\n")
            },

            {
                hold: 180,

                margin: {
                    top: 1,
                    left: 2
                },

                content: [
                    "██████                  ",
                    "██████            ██████",
                    "                        ",
                    "█                      █",
                    "████████████████████████",
                    "█                      █"
                ].join("\n")
            },
            
            {
                hold: 180,

                margin: {
                    top: 0,
                    left: 0
                },

                content: [
                    "███     ███     ███",
                    "███     ███     ███",
                    "███     ███     ███"
                ].join("\n")
            },

            {
                hold: 180,

                margin: {
                    top: 1,
                    left: 2
                },

                content: [
                    " ███   ███   ███ ",
                    "█████████████████",
                    " ███   ███   ███ "
                ].join("\n")
            },
            
            {
                hold: 180,

                margin: {
                    top: 0,
                    left: 0
                },

                content: [
                    "███     ███     ███",
                    "███     ███     ███",
                    "███     ███     ███"
                ].join("\n")
            },

            {
                hold: 180,

                margin: {
                    top: 1,
                    left: 2
                },

                content: [
                    " ███   ███   ███ ",
                    "█████████████████",
                    " ███   ███   ███ "
                ].join("\n")
            }
        ]
    },

    eyesClosed: {

        margin: {
            top: 6,
            left: 13
        },

        frames: [

            {
                hold: 180,

                margin: {
                    top: 0,
                    left: 0
                },

                content: [
					"                      ",
					"                      ",
                    "                      ",
                    "████████      ████████",
                ].join("\n")
            }
        ]
    },
    
    
    eyeOpen: {

        margin: {
            top: 5,
            left: 13
        },

        frames: [

            {
                hold: 2200,

                margin: {
                    top: 0,
                    left: 0
                },

                content: [
                	"                      ",
                    "     ███              ",
                    "     ███              ",
                    "     ███      ████████",
                ].join("\n")
            }
        ]
    }
};