/// <reference path="FileSaver.d.ts" />
/**
 * @summary Test for "saveAs" function.
 */
function testSaveAs() {
    var data = new Blob(["Hello, world!"], { type: "text/plain;charset=utf-8" });
    var filename = 'hello world.txt';
    var disableAutoBOM = true;
    saveAs(data, filename, disableAutoBOM);
}
