import { smsg } from "./lib/simple.js" 
import { format } from "util"
import { fileURLToPath } from "url"
import path, { join } from "path"
import fs, { unwatchFile, watchFile } from "fs"
import chalk from "chalk"
import fetch from "node-fetch"
import ws from "ws"
const { proto } = (await import("@whiskeysockets/baileys")).default
const isNumber = x => typeof x === "number" && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
clearTimeout(this)
resolve()
}, ms))
export async function handler(chatUpdate) {
this.msgqueque = this.msgqueque || []
this.uptime = this.uptime || Date.now()
if (!chatUpdate) {
return
}
this.pushMessage(chatUpdate.messages).catch(console.error)
let m = chatUpdate.messages[chatUpdate.messages.length - 1]
if (!m) {
return
}
if (global.db.data == null) await global.loadDatabase()
try {
m = smsg(this, m) || m
if (!m) {
return
}
m.exp = 0
try {
const user = global.db.data.users[m.sender]
if (typeof user !== "object") global.db.data.users[m.sender] = {}
if (user) {
if (!("name" in user)) user.name = m.name
if (!("exp" in user) || !isNumber(user.exp)) user.exp = 0
if (!("coin" in user) || !isNumber(user.coin)) user.coin = 0
if (!("bank" in user) || !isNumber(user.bank)) user.bank = 0
if (!("level" in user) || !isNumber(user.level)) user.level = 0
if (!("health" in user) || !isNumber(user.health)) user.health = 100
if (!("genre" in user)) user.genre = ""
if (!("birth" in user)) user.birth = ""
if (!("marry" in user)) user.marry = ""
if (!("description" in user)) user.description = ""
if (!("packstickers" in user)) user.packstickers = null
if (!("premium" in user)) user.premium = false
if (!("premiumTime" in user)) user.premiumTime = 0
if (!("banned" in user)) user.banned = false
if (!("bannedReason" in user)) user.bannedReason = ""
if (!("commands" in user) || !isNumber(user.commands)) user.commands = 0
if (!("afk" in user) || !isNumber(user.afk)) user.afk = -1
if (!("afkReason" in user)) user.afkReason = ""
if (!("warn" in user) || !isNumber(user.warn)) user.warn = 0
// Nueva propiedad para el estado de mute
if (!("isMuted" in user)) user.isMuted = false
} else global.db.data.users[m.sender] = {
name: m.name,
exp: 0,
coin: 0,
bank: 0,
level: 0,
health: 100,
genre: "",
birth: "",
marry: "",
description: "",
packstickers: null,
premium: false,
premiumTime: 0,
banned: false,
bannedReason: "",
commands: 0,
afk: -1,
afkReason: "",
warn: 0,
// Nueva propiedad para el estado de mute
isMuted: false
}
const chat = global.db.data.chats[m.chat]
if (typeof chat !== "object") global.db.data.chats[m.chat] = {}
if (chat) {
if (!("isBanned" in chat)) chat.isBanned = false
if (!("isMute" in chat)) chat.isMute = false;
if (!("welcome" in chat)) chat.welcome = false
if (!("sWelcome" in chat)) chat.sWelcome = ""
if (!("sBye" in chat)) chat.sBye = ""
if (!("detect" in chat)) chat.detect = true
if (!("primaryBot" in chat)) chat.primaryBot = null
if (!("modoadmin" in chat)) chat.modoadmin = false
if (!("antiLink" in chat)) chat.antiLink = true
if (!("nsfw" in chat)) chat.nsfw = false
if (!("economy" in chat)) chat.economy = true;
if (!("gacha" in chat)) chat.gacha = true
} else global.db.data.chats[m.chat] = {
isBanned: false,
isMute: false,
welcome: false,
sWelcome: "",
sBye: "",
detect: true,
primaryBot: null,
modoadmin: false,
antiLink: true,
nsfw: false,
economy: true,
gacha: true
}
const settings = global.db.data.settings[this.user.jid]
if (typeof settings !== "object") global.db.data.settings[this.user.jid] = {}
if (settings) {
if (!("self" in settings)) settings.self = false
if (!("jadibotmd" in settings)) settings.jadibotmd = true
} else global.db.data.settings[this.user.jid] = {
self: false,
jadibotmd: true
}} catch (e) {
console.error(e)
}
if (typeof m.text !== "string") m.text = ""
const user = global.db.data.users[m.sender]
try {
const actual = user.name || ""
const nuevo = m.pushName || await this.getName(m.sender)
if (typeof nuevo === "string" && nuevo.trim() && nuevo !== actual) {
user.name = nuevo
}} catch {}
const chat = global.db.data.chats[m.chat]
const settings = global.db.data.settings[this.user.jid]  
const isROwner = [...global.owner.map((number) => number)].map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender)
const isOwner = isROwner || m.fromMe
const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender) || user.premium == true
const isOwners = [this.user.jid, ...global.owner.map((number) => number + "@s.whatsapp.net")].includes(m.sender)
if (opts["queque"] && m.text && !(isPrems)) {
const queque = this.msgqueque, time = 1000 * 5
const previousID = queque[queque.length - 1]
queque.push(m.id || m.key.id)
setInterval(async function () {
if (queque.indexOf(previousID) === -1) clearInterval(this)
await delay(time)
}, time)
}

if (m.isBaileys) return

// ** Lógica para mutear usuarios y eliminar sus mensajes **
if (m.isGroup) {
  const mutedUser = global.db.data.users[m.sender];
  if (mutedUser && mutedUser.isMuted && !isROwner && !isAdmin) { // Asegúrate de que el propietario y administradores no puedan ser muteados por esto
    if (m.key && m.key.remoteJid === m.chat) {
      this.sendMessage(m.chat, { delete: m.key }); // Elimina el mensaje
      return; // No procesar el mensaje del usuario muteado
    }
  }
}
// ** Fin de la lógica de muteo **

m.exp += Math.ceil(Math.random() * 10)
let usedPrefix
const groupMetadata = m.isGroup ? { ...(conn.chats[m.chat]?.metadata || await this.groupMetadata(m.chat).catch(_ => null) || {}), ...(((conn.chats[m.chat]?.metadata || await this.groupMetadata(m.chat).catch(_ => null) || {}).participants) && { participants: ((conn.chats[m.chat]?.metadata || await this.groupMetadata(m.chat).catch(_ => null) || {}).participants || []).map(p => ({ ...p, id: p.jid, jid: p.jid, lid: p.lid })) }) } : {}
const participants = ((m.isGroup ? groupMetadata.participants : []) || []).map(participant => ({ id: participant.jid, jid: participant.jid, lid: participant.lid, admin: participant.admin }))
const userGroup = (m.isGroup ? participants.find((u) => conn.decodeJid(u.jid) === m.sender) : {}) || {}
const botGroup = (m.isGroup ? participants.find((u) => conn.decodeJid(u.jid) == this.user.jid) : {}) || {}
const isRAdmin = userGroup?.admin == "superadmin" || false
const isAdmin = isRAdmin || userGroup?.admin == "admin" || false
const isBotAdmin = botGroup?.admin || false
const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "./plugins")
for (const name in global.plugins) {
const plugin = global.plugins[name]
if (!plugin) continue
if (plugin.disabled) continue
const __filename = join(___dirname, name)
if (typeof plugin.all === "function") {
try {
await plugin.all.call(this, m, {
chatUpdate,
__dirname: ___dirname,
__filename,
user,
chat,
settings
})
} catch (err) {
console.error(err)
}}
if (!opts["restrict"])
if (plugin.tags && plugin.tags.includes("admin")) {
continue
}
const strRegex = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")
const pluginPrefix = plugin.customPrefix || conn.prefix || global.prefix
const match = (pluginPrefix instanceof RegExp ?
[[pluginPrefix.exec(m.text), pluginPrefix]] :
Array.isArray(pluginPrefix) ?
pluginPrefix.map(prefix => {
const regex = prefix instanceof RegExp ?
prefix : new RegExp(strRegex(prefix))
return [regex.exec(m.text), regex]
}) : typeof pluginPrefix === "string" ?
[[new RegExp(strRegex(pluginPrefix)).exec(m.text), new RegExp(strRegex(pluginPrefix))]] :
[[[], new RegExp]]).find(prefix => prefix[1])
if (typeof plugin.before === "function") {
if (await plugin.before.call(this, m, {
match,
conn: this,
participants,
groupMetadata,
userGroup,
botGroup,
isROwner,
isOwner,
isRAdmin,
isAdmin,
isBotAdmin,
isPrems,
chatUpdate,
__dirname: ___dirname,
__filename,
user,
chat,
settings
})) {
continue
}}
if (typeof plugin !== "function") {
continue
}
if ((usedPrefix = (match[0] || "")[0])) {
const noPrefix = m.text.replace(usedPrefix, "")
let [command, ...args] = noPrefix.trim().split(" ").filter(v => v)
args = args || []
let _args = noPrefix.trim().split(" ").slice(1)
let text = _args.join(" ")
command = (command || "").toLowerCase()

// ** Aquí se define el comando mute y unmute **
if (command === "mute" || command === "unmute") {
  if (!m.isGroup) {
    await this.reply(m.chat, `『✦』El comando *${command}* solo puede ser usado en grupos.`, m, rcanal).then(_ => m.react('✖️'));
    continue;
  }
  if (!isAdmin && !isOwner) {
    await this.reply(m.chat, `『✦』El comando *${command}* solo puede ser usado por administradores o el propietario del bot.`, m, rcanal).then(_ => m.react('✖️'));
    continue;
  }
  if (!isBotAdmin) {
    await this.reply(m.chat, `『✦』Para ejecutar el comando *${command}* debo ser administrador del grupo.`, m, rcanal).then(_ => m.react('✖️'));
    continue;
  }

  let target = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
  if (!target) {
    await this.reply(m.chat, `『✦』Para usar *${command}* debes etiquetar a alguien o responder a su mensaje.`, m, rcanal).then(_ => m.react('✖️'));
    continue;
  }

  if (target === this.user.jid) {
    await this.reply(m.chat, `『✦』No me puedo ${command === "mute" ? "mutear" : "desmutear"} a mí mismo.`, m, rcanal).then(_ => m.react('✖️'));
    continue;
  }

  // Verificar si el objetivo es un propietario o administrador
  const targetIsOwner = isROwner || global.owner.map((number) => number + "@s.whatsapp.net").includes(target);
  const targetUserGroup = participants.find(u => u.jid === target);
  const targetIsAdmin = targetUserGroup?.admin === "superadmin" || targetUserGroup?.admin === "admin";

  if ((targetIsOwner || targetIsAdmin) && !isOwner) { // Solo el propietario puede mutear/desmutear a otros propietarios/administradores
    await this.reply(m.chat, `『✦』No puedes ${command === "mute" ? "mutear" : "desmutear"} a un administrador o al propietario del bot.`, m, rcanal).then(_ => m.react('✖️'));
    continue;
  }


  const targetUser = global.db.data.users[target];
  if (!targetUser) {
    await this.reply(m.chat, `『✦』El usuario no está registrado en la base de datos.`, m, rcanal).then(_ => m.react('✖️'));
    continue;
  }

  if (command === "mute") {
    if (targetUser.isMuted) {
      await this.reply(m.chat, `『✦』El usuario @${target.split('@')[0]} ya está muteado.`, m, rcanal).then(_ => m.react('✖️'));
      continue;
    }
    targetUser.isMuted = true;
    await this.reply(m.chat, `『✦』El usuario @${target.split('@')[0]} ha sido muteado. Sus mensajes serán eliminados.`, m, rcanal).then(_ => m.react('✅'));
  } else if (command === "unmute") {
    if (!targetUser.isMuted) {
      await this.reply(m.chat, `『✦』El usuario @${target.split('@')[0]} no está muteado.`, m, rcanal).then(_ => m.react('✖️'));
      continue;
    }
    targetUser.isMuted = false;
    await this.reply(m.chat, `『✦』El usuario @${target.split('@')[0]} ha sido desmuteado.`, m, rcanal).then(_ => m.react('✅'));
  }
  continue; // Salta el resto del procesamiento de plugins para el comando mute/unmute
}
// ** Fin de la definición del comando mute y unmute **

const fail = plugin.fail || global.dfail
const isAccept = plugin.command instanceof RegExp ?
plugin.command.test(command) :
Array.isArray(plugin.command) ?
plugin.command.some(cmd => cmd instanceof RegExp ?
cmd.test(command) : cmd === command) :
typeof plugin.command === "string" ?
plugin.command === command : false
global.comando = command
if (!isOwners && settings.self) return
if ((m.id.startsWith("NJX-") || (m.id.startsWith("BAE5") && m.id.length === 16) || (m.id.startsWith("B24E") && m.id.length === 20))) return
if (global.db.data.chats[m.chat].primaryBot && global.db.data.chats[m.chat].primaryBot !== this.user.jid) {
const primaryBotConn = global.conns.find(conn => conn.user.jid === global.db.data.chats[m.chat].primaryBot && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED)
const participants = m.isGroup ? (await this.groupMetadata(m.chat).catch(() => ({ participants: [] }))).participants : []
const primaryBotInGroup = participants.some(p => p.jid === global.db.data.chats[m.chat].primaryBot)
if (primaryBotConn && primaryBotInGroup || global.db.data.chats[m.chat].primaryBot === global.conn.user.jid) {
throw !1
} else {
global.db.data.chats[m.chat].primaryBot = null
}} else {
}
if (!isAccept) continue
m.plugin = name
if (isAccept) { global.db.data.users[m.sender].commands = (global.db.data.users[m.sender].commands || 0) + 1 }
if (chat) {
const botId = this.user.jid
const primaryBotId = chat.primaryBot
if (name !== "group-banchat.js" && chat?.isBanned && !isROwner) {
if (!primaryBotId || primaryBotId === botId) {
const aviso = `ꕥ El bot *${botname}* está desactivado en este grupo\n\n> ✦ Un *administrador* puede activarlo con el comando:\n> » *${usedPrefix}bot on*`.trim()
await m.reply(aviso)
return
}}
if (m.text && user.banned && !isROwner) {
const mensaje = `ꕥ Estas baneado/a, no puedes usar comandos en este bot!\n\n> ● *Razón ›* ${user.bannedReason}\n\n> ● Si este Bot es cuenta oficial y tienes evidencia que respalde que este mensaje es un error, puedes exponer tu caso con un moderador.`.trim()
if (!primaryBotId || primaryBotId === botId) {
m.reply(mensaje)
return
}}}
if (!isOwners && !m.chat.endsWith('g.us') && !/code|p|ping|qr|estado|status|infobot|botinfo|report|reportar|invite|join|logout|suggest|help|menu/gim.test(m.text)) return
const adminMode = chat.modoadmin || false
const wa = plugin.botAdmin || plugin.admin || plugin.group || plugin || noPrefix || pluginPrefix || m.text.slice(0, 1) === pluginPrefix || plugin.command
if (adminMode && !isOwner && m.isGroup && !isAdmin && wa) return
if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) {
fail("owner", m, this)
continue
}
if (plugin.rowner && !isROwner) {
fail("rowner", m, this)
continue
}
if (plugin.owner && !isOwner) {
fail("owner", m, this)
continue
}
if (plugin.premium && !isPrems) {
fail("premium", m, this)
continue
}
if (plugin.group && !m.isGroup) {
fail("group", m, this)
continue
} else if (plugin.botAdmin && !isBotAdmin) {
fail("botAdmin", m, this)
continue
} else if (plugin.admin && !isAdmin) {
fail("admin", m, this)
continue
}
if (plugin.private && m.isGroup) {
fail("private", m, this)
continue
}
m.isCommand = true
m.exp += plugin.exp ? parseInt(plugin.exp) : 10
let extra = {
match,
usedPrefix,
noPrefix,
_args,
args,
command,
text,
conn: this,
participants,
groupMetadata,
userGroup,
botGroup,
isROwner,
isOwner,
isRAdmin,
isAdmin,
isBotAdmin,
isPrems,
chatUpdate,
__dirname: ___dirname,
__filename,
user,
chat,
settings
}
try {
await plugin.call(this, m, extra)
} catch (err) {
m.error = err
console.error(err)
} finally {
if (typeof plugin.after === "function") {
try {
await plugin.after.call(this, m, extra)
} catch (err) {
console.error(err)
}}}}}} catch (err) {
console.error(err)
} finally {
if (opts["queque"] && m.text) {
const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
if (quequeIndex !== -1)
this.msgqueque.splice(quequeIndex, 1)
}
let user, stats = global.db.data.stats
if (m) {
if (m.sender && (user = global.db.data.users[m.sender])) {
user.exp += m.exp
}}
try {
if (!opts["noprint"]) await (await import("./lib/print.js")).default(m, this)
} catch (err) {
console.warn(err)
console.log(m.message)
}}}
global.dfail = (type, m, conn) => {
const msg = {
rowner: `『✦』El comando *${comando}* solo puede ser usado por los creadores del bot.`, 
owner: `『✦』El comando *${comando}* solo puede ser usado por los desarrolladores del bot.`, 
mods: `『✦』El comando *${comando}* solo puede ser usado por los moderadores del bot.`, 
premium: `『✦』El comando *${comando}* solo puede ser usado por los usuarios premium.`, 
group: `『✦』El comando *${comando}* solo puede ser usado en grupos.`,
private: `『✦』El comando *${comando}* solo puede ser usado al chat privado del bot.`,
admin: `『✦』El comando *${comando}* solo puede ser usado por los administradores del grupo.`, 
botAdmin: `『✦』Para ejecutar el comando *${comando}* debo ser administrador del grupo.`,
restrict: `『✦』Esta caracteristica está desactivada.`
}[type]
if (msg) return conn.reply(m.chat, msg, m, rcanal).then(_ => m.react('✖️'))
}
let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
unwatchFile(file)
console.log(chalk.magenta("Se actualizo 'handler.js'"))
if (global.reloadHandler) console.log(await global.reloadHandler())
})