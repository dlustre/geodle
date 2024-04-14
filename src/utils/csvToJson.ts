import { readFileSync, writeFile } from "fs";
import { exit } from "process";

const csv = readFileSync("OC_Zip_Dataset.csv");

const lines = csv.toString().split("\n");
const objects = [];
const headers = lines[0]?.split(",");

if (!headers) exit(1);

for (let row = 1; row < lines.length; row++) {
    if (!lines[row]) continue;
    const obj: Record<string, string> = {};
    const currentLine = lines[row]?.split(",");

    if (!currentLine) continue;

    for (let col = 0; col < headers.length; col++) {
        const currentCol = headers[col];
        if (!currentCol) continue;
        const currentCell = currentLine[col];
        if (!currentCell) continue;
        obj[currentCol] = currentCell;
    }
    objects.push(obj);
}

writeFile("OC_Zip_Dataset.json", JSON.stringify(objects), (err) => {
    if (err) console.error(err);
});