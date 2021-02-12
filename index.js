const { error } = require("console");
const Discord = require("discord.js");
const config = require ("./config.json");
const client = new Discord.Client();
let tokenList = config.token;
let next = 0;

async function main(){
	const token = tokenList.shift();
	
	if (!token){
		console.log("Unknown token!");
		client.destroy();
		return;
	}
	
	if (!await client.login(token)){
		console.log("Token '" + token.substring(0, 10) + "' was failed!");
		client.destroy();
		main();
		return;
	}
	
	console.log("Logged at: " + client.user.username);
	
	client.on("error", (error) => {
		console.log(error);
	});
	
	client.on("message", (message) => {
		if (!message.author.bot){
			return;
		}
		const guild = message.guild;
		
		if (message.mentions != null){
			if (message.mentions.users.first() != null){
				
				tryToSend(message.mentions.users.first());
			}
		} else if (message.embeds.length > 0){
			const embed = message.embeds[0];
			
			const userInTitle = getMemberByText(embed.title);
			if (userInTitle != null){
				tryToSend(client.users.find(u=> u.id == userInTitle));
			}
			
			const userInDescription = getMemberByText(embed.description);
			if (userInDescription != null){
				tryToSend(client.users.find(u=> u.id == userInDescription));
			}
		}
	});
}

function tryToSend(member){
	if (new Date().getTime() > next){
		console.log(member);
		if (member != null && member != undefined){
			next = new Date().getTime() + (config.seconds * 1000);
			member.send(config.message).then(()=> {
				console.log("Message sent: " + member.tag + "("+member.id+")")
			}).catch(err => {
				if(err == null) { //"DiscordAPIError: You are opening direct messages too fast.
					console.log("Logando em outro token!", client.user.tag)
					client.destroy()
					main();
				} else {
					console.log("Message: " + err);
				}
			});
		}
	}
}

function getMemberByText(text){
	if (text.includes("<@") && text.includes(">")){
		const split1 = text.split("<@");
		if (split1.length > 0){
			const split2 = split1[0].split(">");
			if (split2.length > 0){
				const id = split2[0];
				return id;
			}
		}
	}
	return null;
}

main();