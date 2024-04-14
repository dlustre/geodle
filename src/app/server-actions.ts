'use server';

import { readFileSync, writeFile } from "fs";
import { URLSearchParams } from "url";
import { z } from "zod";
import { env } from "~/env";

const QueryParamsSchema = z.object({
    id: z.string(),
    lat: z.string(),
    long: z.string(),
    recs: z.string(),
    format: z.string()
});

type QueryParams = z.infer<typeof QueryParamsSchema>;

const ResponseSchema = z.object({
    // Version: z.string(),
    // TransmissionReference: z.string(),
    // TransmissionResults: z.string(),
    // TotalRecords: z.number(),
    Records: z.array(z.object({
        City: z.string(),
        State: z.string(),
        PostalCode: z.string(),
        Latitude: z.string(),
        Longitude: z.string(),
        Distance: z.string(), // Distance from the input coordinates
    })).min(1), // At least one record
});

type Response = z.infer<typeof ResponseSchema>;

export async function getGeoInfoFromCoords(lat: string, long: string): Promise<Response["Records"][0] | undefined> {
    try {
        // console.log('getGeoInfoFromCoords');

        const queryParams = {
            id: env.API_KEY,
            lat,
            long,
            recs: "1",
            format: "json",
        } satisfies QueryParams;

        const validQueryParams = QueryParamsSchema.parse(queryParams);

        const params = new URLSearchParams(validQueryParams).toString();
        const urlString = `https://reversegeo.melissadata.net/v3/web/ReverseGeoCode/doLookup?${params}`;

        const res = await fetch(urlString);
        const data: Response = ResponseSchema.parse(await res.json());

        // console.log(data);

        return data.Records[0];
    } catch (err) {
        console.error(err);
    }
}

function csvToJson(csv: string) {
    const lines = csv.split("\n");
    const headers = lines[0]?.split(",").map(header => header.trim());

    if (!headers) return;

    const data = lines.slice(1).map(line => {
        const entries = line.split(",").map(entry => entry.trim());
        return headers.reduce((acc, header, index) => {
            if (entries[index]) {
                acc[header] = entries[index]!;
            }
            return acc;
        }, {} as Record<string, string>);
    });

    return data.filter(obj => Object.keys(obj).length > 0);
}

export async function getZips() {
    try {
        const csv = readFileSync("OC_Zip_Dataset.csv", 'utf8');
        const data = csvToJson(csv);
        const json = JSON.stringify({ data }, null, 4);

        writeFile("OC_Zip_Dataset.json", json, err => {
            if (err) {
                console.error('Error writing to file:', err);
            } else {
                console.log('File has been saved.');
            }
        });
    } catch (err) {
        console.error('Error:', err);
    }
}