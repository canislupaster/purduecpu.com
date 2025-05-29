package com.purduecpu

import io.jooby.*
import io.jooby.exception.NotFoundException
import io.jooby.handler.AssetHandler
import io.jooby.internal.ClassPathAssetSource
import io.jooby.kt.runApp
import io.jooby.netty.NettyServer
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.json.*
import kotlin.time.Duration
import kotlin.time.Duration.Companion.minutes
import kotlin.time.Duration.Companion.seconds

val json = Json {
    classDiscriminatorMode= ClassDiscriminatorMode.NONE
    encodeDefaults=true
}

enum class APIErrTy {
    NotFound,
    Unauthorized,
    BadRequest,
    CFError,
    RateLimited,
    Other;

    fun code() = when(this) {
        NotFound -> StatusCode.NOT_FOUND
        Unauthorized -> StatusCode.UNAUTHORIZED
        BadRequest -> StatusCode.BAD_REQUEST
        RateLimited -> StatusCode.TOO_MANY_REQUESTS
        Other,CFError -> StatusCode.SERVER_ERROR
    }

    fun str() = when(this) {
        NotFound -> "notFound"
        Unauthorized -> "unauthorized"
        BadRequest -> "badRequest"
        RateLimited -> "rateLimited"
        Other -> "other"
        CFError -> "cfError"
    }

    fun err(msg: String?=null) = APIError(this, msg)
}

data class APIError(val ty: APIErrTy, val msg: String?): Throwable(msg ?: ty.str())

inline fun<reified T> Context.json() =
    runCatching {
        json.decodeFromString<T>(body().value())
    }.getOrElse {
        throw APIErrTy.BadRequest.err("Invalid JSON: ${it.message}")
    }

@OptIn(ExperimentalSerializationApi::class)
fun Context.resp(err: APIError?=null, builder: JsonObjectBuilder.() -> Unit): Context {
    val stream = responseStream(MediaType.json)

    json.encodeToStream(buildJsonObject {
        if (err != null) {
            put("status", "error")
            put("error", err.ty.str())
            put("message", err.msg)
        } else put("status", "ok")

        builder()
    }, stream)

    stream.close()
    return this
}

suspend fun main(args: Array<String>) {
    runApp(args) {
        val db = DB(environment)

        val isRevProxy = environment.getProperty("useForwardedFor")=="true"
        before {
            if (isRevProxy)
                ctx.header("X-Forwarded-For").valueOrNull()?.let {
                    ctx.remoteAddress=it.split(",").last().trim()
                }
        }

        install(NettyServer())

        assets("/**", AssetHandler("404.html", ClassPathAssetSource(classLoader, "client")))

        error { ctx, cause, code ->
            log.error("Request error", cause)

            when (cause) {
                is APIError -> {
                    ctx.setResponseCode(cause.ty.code())
                    ctx.resp(cause) {}
                }
                is NotFoundException -> {
                    ctx.setResponseCode(StatusCode.NOT_FOUND)
                    ctx.resp(APIErrTy.NotFound.err()) {}
                }
                else -> {
                    ctx.setResponseCode(code)
                    ctx.resp(APIErrTy.Other.err(cause.message)) {}
                }
            }
        }
    }
}