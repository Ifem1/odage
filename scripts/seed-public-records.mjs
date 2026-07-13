import { readFileSync } from "node:fs";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1)]),
);
const client = createClient({
  chain: studionet,
  account: createAccount(env.GENLAYER_PRIVATE_KEY),
});
const address = env.NEXT_PUBLIC_ODAGE_CONTRACT_ADDRESS;

const records = [
  ["Constitution of the Federal Republic of Nigeria 1999", "Nigeria's current constitutional framework took effect on 29 May 1999 and defines the structure and powers of the federal republic.", "29 May 1999", "Federal Republic of Nigeria", "https://www.refworld.org/legal/legislation/natlegbod/1999/en/67418"],
  ["African Union Founded", "The African Union was officially launched in Durban in July 2002 as the successor to the Organisation of African Unity.", "July 2002", "Durban, South Africa", "https://au.int/en/overview"],
  ["ECOWAS Establishment", "The Economic Community of West African States was established by the Treaty of Lagos to promote regional economic integration.", "28 May 1975", "Lagos, Nigeria", "https://www.ecowas.int/about-ecowas/"],
  ["Nigeria Independence", "Nigeria became independent from British colonial rule on 1 October 1960.", "1 October 1960", "Nigeria", "https://www.britannica.com/place/Nigeria/Independent-Nigeria"],
  ["Lagos National Museum", "The National Museum Lagos opened in 1957 and preserves major collections of Nigerian archaeological and ethnographic heritage.", "1957", "Onikan, Lagos", "https://museum.ng/lagos/"],
  ["Sukur Cultural Landscape", "Sukur Cultural Landscape became Nigeria's first UNESCO World Heritage property in 1999.", "1999", "Adamawa State, Nigeria", "https://whc.unesco.org/en/list/938/"],
  ["Osun-Osogbo Sacred Grove", "UNESCO inscribed the Osun-Osogbo Sacred Grove as a World Heritage property in 2005.", "2005", "Osogbo, Osun State", "https://whc.unesco.org/en/list/1118/"],
  ["Kano City Walls", "The ancient Kano city walls and associated sites preserve evidence of the city's long political and commercial history.", "Historic", "Kano, Nigeria", "https://whc.unesco.org/en/tentativelists/5171/"],
  ["University of Ibadan", "University College Ibadan opened in 1948 and later became the independent University of Ibadan.", "1948", "Ibadan, Nigeria", "https://ui.edu.ng/content/history"],
  ["University of Nigeria Nsukka", "The University of Nigeria formally opened in October 1960 as Nigeria's first full-fledged indigenous university.", "October 1960", "Nsukka, Nigeria", "https://www.unn.edu.ng/brief-history/"],
  ["National Youth Service Corps", "Nigeria established the National Youth Service Corps in 1973 to promote national unity through graduate service.", "1973", "Nigeria", "https://www.nysc.gov.ng/"],
  ["Third Mainland Bridge", "The completed Third Mainland Bridge opened in 1990 and became a major transport link across Lagos Lagoon.", "1990", "Lagos, Nigeria", "https://fmino.gov.ng/"],
  ["Nigerian National Flag", "Michael Taiwo Akinkunmi designed Nigeria's green-white-green national flag, first officially hoisted at independence in 1960.", "1 October 1960", "Nigeria", "https://nationalinstitute.org.ng/"],
  ["Nigerian Currency Decimalisation", "Nigeria replaced pounds with the naira and kobo under decimal currency on 1 January 1973.", "1 January 1973", "Nigeria", "https://www.cbn.gov.ng/currency/historycur.asp"],
  ["National Theatre Lagos", "The National Theatre in Iganmu was completed for the 1977 Festival of Arts and Culture and remains a major Nigerian cultural landmark.", "1976–1977", "Iganmu, Lagos", "https://nationaltheatre.gov.ng/"],
  ["Nok Terracotta Tradition", "Nok archaeological sites are associated with an ancient terracotta-producing tradition in central Nigeria.", "First millennium BCE", "Central Nigeria", "https://www.metmuseum.org/toah/hd/nok/hd_nok.htm"],
  ["Benin Bronzes", "The Benin court arts include brass and ivory works produced for the royal palace of the Kingdom of Benin over several centuries.", "Historic", "Benin City, Nigeria", "https://www.britishmuseum.org/about-us/british-museum-story/contested-objects-collection/benin-bronzes"],
];

for (let index = 0; index < records.length; index += 1) {
  const [title, summary, timeframe, context, source] = records[index];
  const hash = await client.writeContract({
    address,
    functionName: "create_record",
    args: [title, summary, timeframe, context, JSON.stringify([source]), "low", "public", new Date().toISOString()],
    value: 0n,
  });
  console.log(`${index + 1}/${records.length} ${hash} ${title}`);
  await client.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
    interval: 5_000,
    retries: 120,
  });
}

const summary = await client.readContract({ address, functionName: "get_contract_summary", args: [] });
console.log(`FINAL_SUMMARY=${summary}`);
