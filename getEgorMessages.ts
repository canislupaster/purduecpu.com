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

const {channels, emojis} = (await client.guilds.fetch(discordGuildId));

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
	null,
	["749361934515699726", "1272413438500667392"],
	["749361934515699726", "1272418820870635551"],
	["749361934515699726", "1170559298934423552"],
	null,
	["749361934515699726","1458297448371064834"],
	["749361934515699726","1458297503186288661"],
	["749361934515699726","1458297554235297822"],
	["749361934515699726","1458297576062189710"],
	["749361934515699726","1458297607020347442"],
	["749361934515699726","1458297627140554954"],
	["749361934515699726","1458297682266161254"],
	["749361934515699726","1458297739208163543"],
	["749361934515699726","1458297757763895381"],
	["749361934515699726","1458297771529474276"],
	["749361934515699726","1458297876957499434"],
	["749361934515699726","1458297909236727863"],
	null,
	["1462301043479023924","1462682655505256482"],
	["1462301043479023924","1462682693232889918"],
	["1462301043479023924","1462682715378810902"],
].map(async x => {
	if (!x) return null;

	const [chan, id] = x;
	const c = await channels.fetch(chan);
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
	const last = a.length>0 ? a[a.length-1] : null;
	if (last && b!=null && last.username==b.username) {
		return [...a.slice(0,a.length-1), {...last,
			content: [...last.content, ...b.content]}];
	}

	return [...a,b];
}, []);

await writeFile("./egor.json", JSON.stringify(out));
