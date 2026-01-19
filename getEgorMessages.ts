import { Client, GatewayIntentBits, TextChannel } from "discord.js";
import { writeFile } from "node:fs/promises";
import { discordGuildId } from "./src/consts";

const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildMembers
] });

const p=new Promise<void>((res,rej) => {
	client.once("clientReady", ()=>res());
	client.once("error", (err)=>rej(err));
});

await client.login(process.env.DISCORD_BOT_TOKEN);
await p;

const chanMgr = (await client.guilds.fetch(discordGuildId)).channels;

const msgs = await Promise.all([
	["749361934515699726", "1170477843537481818"],
	["749361934515699726", "1251224488868188200"],
	["749361934515699726", "1251224495633600592"],
	["749361934515699726", "1007892327634829372"],
	["749361934515699726", "1007892355321450557"],
	["749361934515699726", "1007892521847885835"],
	["749361934515699726", "1007892555066769450"],
	["749361934515699726", "1007892580366827670"],
	["749361934515699726", "1007892647035285597"],
	["749361934515699726", "1007892694179258379"],
	["749361934515699726", "1007892978611798038"],
	["749361934515699726", "1153430137866559510"],
	["749361934515699726", "1151653076210548796"],
	["749361934515699726", "1272413438500667392"],
	["749361934515699726", "1272418820870635551"],
	["749361934515699726", "1170559298934423552"]
].map(async ([chan,id]) => {
	const c = await chanMgr.fetch(chan);
	if (!(c instanceof TextChannel)) throw "not text channel";
	const msg = await c.messages.fetch(id);
	
	return {
		avatar: msg.author.avatarURL({forceStatic: true}) ?? msg.author.defaultAvatarURL,
		username: msg.author.username,
		content: [msg.cleanContent],
		img: msg.embeds.map(v=>v.thumbnail?.url).filter(x=>x!=null)
	};
}));

const out = msgs.reduce<typeof msgs>((a,b) => {
	if (a.length>0 && a[a.length-1].username==b.username) {
		return [...a.slice(0,a.length-1), {...a[a.length-1],
			content: [...a[a.length-1].content, ...b.content]}];
	}

	return [...a,b];
}, []);

await writeFile("./egor.json", JSON.stringify(out));
