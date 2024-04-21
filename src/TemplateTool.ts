
export class TemplateTool {
    static inputVariables =["prev", "post"];
    static _promptText = 
        "Answer question by providing a code snippet.\n\n"
        + "// Example\n"
        + "// Given the following source code:\n"
        + "int add(int a, int b) {{\n"
        + "// What can be folllowing code:\n"
        + "1) return a + b;\n"
        + "2) int result = a + b;\nreturn result;\n"
        /*+ "# Given the following source code:\n"
        + "int multiply(int a, int b) {{\n{{NEW CODE}}\n}}\n"
        + "## Please suggest a replacement for {{NEW CODE}}:\n"
        + "<1> return a * b;\n"
        + "<2> int result = a * b;\nreturn result;\n"
        + "# Given the following source code:\n"
        + "int devide({{NEW CODE}}) {{\nreturn a / b;\n}}\n"
        + "## Please suggest a replacement for {{NEW CODE}}:\n"
        + "<1> int a, int b\n"*/
        + "\n"
        + "// Qeusiton\n"
        + // Given the following source code:\n"
        + "{prev}\n"
        + "// Suggest following code:\n";

    static promptText = 
        "Answer question by providing a code snippet.\n\n"
        + "# Example\n"
        + "## Given the following source code:\n"
        + "```cpp\n"
        + "int add(int a, int b) {{\n"
        + "\t[NEW CODE]\n}}\n"
        + "```\n"
        + "## Replacements for [NEW CODE] are:\n"
        + "1.\n```cpp\n"
        + "\treturn a + b;\n"
        + "```\n"
        + "2.\n"
        + "```cpp\n"
        + "\tint result = a + b;\n"
        + "\treturn result;\n"
        + "```\n"
        + "3.\n"
        + "```cpp\n"
        + "\tint sum = a + b;\n"
        + "\treturn sum;\n"
        + "```\n"
        + "\n"
        + "# Example\n"
        + "## Given the following source code:\n"
        + "```cpp\n"
        + "int multiply(int a, int b) {{\n\treturn [NEW CODE]\n}}\n"
        + "## Replacements for [NEW CODE] are:\n"
        + "1.\n```cpp\n"
        + "a * b;\n"
        + "```\n"
        + "\n"
        + "# Qeusiton\n"
        + "## Given the following source code:\n"
        + "```cpp\n"
        + "{prev}[NEW CODE]{post}\n"
        + "```\n"
        + "## Replacements for [NEW CODE] are:\n";

    static START_TXT = "```cpp\n";
    static END_TXT = "```";
    static DELEMETER = "```"
    static *indexGenerator() : Generator<string>{
        let index = 1;
        while (true) {
            if (index == 1) {
                yield "```cpp\n";
            } else {
                yield ".\n```cpp\n";
            }
            index++;
        }
    }
    static parseResponse(response: string) :string[] {
        let index = this.indexGenerator();
        let result: string[] = [];
        
        while (true) {
            let next = index.next().value;
            if (!response.includes(next)) {
                if (result.length == 0) {
                    return result;
                }
                let last = result[result.length - 1] ;
                let lastIndex = last.indexOf(this.END_TXT);
                if (lastIndex != undefined) {last = last.slice(0, lastIndex);}
                result[result.length - 1] = last;
                return result;
            }
            let last = (result.length == 0)? null :result[result.length - 1] ;

            let fromIndex = response.indexOf(next);
            fromIndex = fromIndex + next.length;
            response = response.slice(fromIndex);

            if (last !== null) {
                let lastIndex = last.indexOf(this.END_TXT);
                result[result.length - 1] = last.slice(0, lastIndex);
            }

            result.push(response)
        
        }
    }
}

    // replace all \n to \r\n
    TemplateTool.promptText = TemplateTool.promptText.replace("\n", "\r\n");