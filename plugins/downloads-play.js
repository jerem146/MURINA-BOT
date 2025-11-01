import fetch from "node-fetch"
import yts from "yt-search"

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text.trim()) return conn.reply(m.chat, `❀ Por favor, ingresa el nombre de la música o video a descargar.`, m)
    await m.react("🕒")

    const apiUrl = `https://api.nexfuture.com.br/api/downloads/youtube/play?query=${encodeURIComponent(text)}`
    const response = await fetch(apiUrl)
    const data = await response.json()

    if (!data.status || !data.resultado) throw "ꕥ No se encontraron resultados."

    const { imagem, titulo, desc, tempo, views, audio, video } = data.resultado
    const vistas = formatViews(views)

    const caption = `
「✦」Descargando *<${titulo}>*
> ❑ Duración » *${tempo || "Desconocida"}*
> ♡ Vistas » *${vistas}*
> ☁︎ Descripción » ${desc || "Sin descripción"}
`.trim()

    await conn.sendMessage(
      m.chat,
      {
        image: { url: imagem },
        caption,
      },
      { quoted: m }
    )

    if (["play", "yta", "ytmp3", "playaudio"].includes(command)) {
      if (!audio) throw "⚠ No se pudo obtener el audio."
      await m.reply(`> ❀ *Audio procesado correctamente.*`)
      await conn.sendMessage(
        m.chat,
        {
          audio: { url: audio },
          fileName: `${titulo}.mp3`,
          mimetype: "audio/mpeg",
          ptt: false,
        },
        { quoted: m }
      )
    } else if (["play2", "ytv", "ytmp4", "mp4", "playvideo"].includes(command)) {
      if (!video) throw "⚠ No se pudo obtener el video."
      await m.reply(`> ❀ *Video procesado correctamente.*`)
      await conn.sendMessage(
        m.chat,
        {
          video: { url: video },
          fileName: `${titulo}.mp4`,
          caption: `> ✦ ${titulo}`,
          mimetype: "video/mp4",
        },
        { quoted: m }
      )
    }

    await m.react("✔️")
  } catch (e) {
    console.error("Error en el comando play:", e)
    await m.react("✖️")
    return conn.reply(
      m.chat,
      typeof e === "string"
        ? e
        : "⚠︎ Se ha producido un problema.\n> Usa *" +
            usedPrefix +
            "report* para informarlo.\n\n" +
            e.message,
      m
    )
  }
}

handler.command = handler.help = [
  "play",
  "yta",
  "ytmp3",
  "playaudio",
  "play2",
  "ytv",
  "ytmp4",
  "mp4",
  "playvideo",
]
handler.tags = ["descargas"]
handler.group = true

export default handler

function formatViews(views) {
  if (!views) return "No disponible"
  if (views >= 1_000_000_000)
    return `${(views / 1_000_000_000).toFixed(1)}B (${views.toLocaleString()})`
  if (views >= 1_000_000)
    return `${(views / 1_000_000).toFixed(1)}M (${views.toLocaleString()})`
  if (views >= 1_000)
    return `${(views / 1_000).toFixed(1)}k (${views.toLocaleString()})`
  return views.toString()
}