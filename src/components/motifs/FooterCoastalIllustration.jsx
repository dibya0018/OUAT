import { useId } from 'react'
import { cx } from '../../lib/format'

/**
 * Goa coastal sunset scene — palm fronds, ocean waves, setting sun, clouds.
 * Complete scenic illustration for premium footer backdrop.
 */
export default function FooterCoastalIllustration({ className }) {
  const uid = useId().replace(/:/g, '')

  return (
    <svg
      viewBox="0 0 1440 420"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
      className={cx('pointer-events-none h-full w-full', className)}
    >
      <g stroke="#c9d5c0" fill="none" strokeLinecap="round" strokeLinejoin="round">
        
        {/* LEFT PALM FRONDS — Large, graceful framing */}
        <g opacity="0.85" strokeWidth="1.2">
          {/* Main frond stems */}
          <path d="M-20 420 Q30 380 60 320 Q75 280 85 220 Q90 160 88 100" />
          <path d="M10 420 Q45 385 70 330 Q82 290 90 235 Q95 175 92 115" />
          
          {/* Left frond leaves */}
          <g>
            <path d="M60 320 Q35 305 15 298" strokeWidth="1" />
            <path d="M65 300 Q40 288 18 285" strokeWidth="1" />
            <path d="M70 280 Q45 270 22 272" strokeWidth="1" />
            <path d="M73 260 Q48 252 25 257" strokeWidth="1" />
            <path d="M77 240 Q52 234 28 242" strokeWidth="1" />
            <path d="M80 220 Q55 216 30 227" strokeWidth="1" />
            <path d="M83 200 Q58 198 32 212" strokeWidth="1" />
            <path d="M85 180 Q60 180 35 197" strokeWidth="1" />
            <path d="M86 160 Q62 162 37 182" strokeWidth="1" />
            <path d="M87 140 Q64 144 40 167" strokeWidth="1" />
            <path d="M88 120 Q66 126 42 152" strokeWidth="1" />
            
            {/* Right side leaves */}
            <path d="M70 330 Q95 318 115 315" strokeWidth="1" />
            <path d="M75 310 Q100 300 122 300" strokeWidth="1" />
            <path d="M78 290 Q103 282 127 285" strokeWidth="1" />
            <path d="M82 270 Q107 264 132 270" strokeWidth="1" />
            <path d="M85 250 Q110 246 137 255" strokeWidth="1" />
            <path d="M88 230 Q113 228 142 240" strokeWidth="1" />
            <path d="M90 210 Q115 210 147 225" strokeWidth="1" />
            <path d="M91 190 Q116 192 150 210" strokeWidth="1" />
            <path d="M92 170 Q117 174 153 195" strokeWidth="1" />
          </g>
        </g>

        {/* RIGHT PALM FRONDS — Mirror composition */}
        <g opacity="0.85" strokeWidth="1.2">
          {/* Main frond stems */}
          <path d="M1460 420 Q1410 380 1380 320 Q1365 280 1355 220 Q1350 160 1352 100" />
          <path d="M1430 420 Q1395 385 1370 330 Q1358 290 1350 235 Q1345 175 1348 115" />
          
          {/* Right frond leaves */}
          <g>
            <path d="M1380 320 Q1405 305 1425 298" strokeWidth="1" />
            <path d="M1375 300 Q1400 288 1422 285" strokeWidth="1" />
            <path d="M1370 280 Q1395 270 1418 272" strokeWidth="1" />
            <path d="M1367 260 Q1392 252 1415 257" strokeWidth="1" />
            <path d="M1363 240 Q1388 234 1412 242" strokeWidth="1" />
            <path d="M1360 220 Q1385 216 1410 227" strokeWidth="1" />
            <path d="M1357 200 Q1382 198 1408 212" strokeWidth="1" />
            <path d="M1355 180 Q1380 180 1405 197" strokeWidth="1" />
            <path d="M1354 160 Q1378 162 1403 182" strokeWidth="1" />
            <path d="M1353 140 Q1376 144 1400 167" strokeWidth="1" />
            <path d="M1352 120 Q1374 126 1398 152" strokeWidth="1" />
            
            {/* Left side leaves */}
            <path d="M1370 330 Q1345 318 1325 315" strokeWidth="1" />
            <path d="M1365 310 Q1340 300 1318 300" strokeWidth="1" />
            <path d="M1362 290 Q1337 282 1313 285" strokeWidth="1" />
            <path d="M1358 270 Q1333 264 1308 270" strokeWidth="1" />
            <path d="M1355 250 Q1330 246 1303 255" strokeWidth="1" />
            <path d="M1352 230 Q1327 228 1298 240" strokeWidth="1" />
            <path d="M1350 210 Q1325 210 1293 225" strokeWidth="1" />
            <path d="M1349 190 Q1324 192 1290 210" strokeWidth="1" />
            <path d="M1348 170 Q1323 174 1287 195" strokeWidth="1" />
          </g>
        </g>

        {/* OCEAN WAVES — Layered, flowing */}
        <g opacity="0.75" strokeWidth="1.5">
          {/* Horizon wave */}
          <path d="M200 280 Q360 275 520 280 Q680 285 840 278 Q1000 283 1160 280 Q1240 278 1320 282" />
          
          {/* Mid-distance waves with foam */}
          <path d="M220 310 Q380 304 540 310 Q700 316 860 308 Q1020 314 1180 310 Q1260 308 1340 312" strokeWidth="1.8" />
          <path d="M225 312 Q245 308 265 310 Q285 312 305 309" strokeWidth="0.8" opacity="0.6" />
          <path d="M445 308 Q465 305 485 308 Q505 310 525 307" strokeWidth="0.8" opacity="0.6" />
          <path d="M715 314 Q735 311 755 314 Q775 316 795 313" strokeWidth="0.8" opacity="0.6" />
          <path d="M985 312 Q1005 309 1025 312 Q1045 314 1065 311" strokeWidth="0.8" opacity="0.6" />
          
          {/* Closer waves with more detail */}
          <path d="M180 345 Q340 338 500 345 Q660 352 820 343 Q980 350 1140 345 Q1220 342 1300 348" strokeWidth="2" />
          <path d="M185 348 Q210 343 235 347 Q260 350 285 345" strokeWidth="1" opacity="0.7" />
          <path d="M340 342 Q365 338 390 342 Q415 345 440 340" strokeWidth="1" opacity="0.7" />
          <path d="M545 350 Q570 346 595 350 Q620 353 645 348" strokeWidth="1" opacity="0.7" />
          <path d="M770 347 Q795 343 820 347 Q845 350 870 345" strokeWidth="1" opacity="0.7" />
          <path d="M1020 352 Q1045 348 1070 352 Q1095 355 1120 350" strokeWidth="1" opacity="0.7" />
          
          {/* Foreground wave — most prominent */}
          <path d="M160 385 Q320 376 480 385 Q640 394 800 383 Q960 392 1120 385 Q1200 381 1280 388" strokeWidth="2.5" />
          <path d="M165 389 Q195 383 225 388 Q255 392 285 386" strokeWidth="1.2" opacity="0.8" />
          <path d="M320 381 Q350 376 380 381 Q410 385 440 379" strokeWidth="1.2" opacity="0.8" />
          <path d="M530 391 Q560 386 590 391 Q620 395 650 389" strokeWidth="1.2" opacity="0.8" />
          <path d="M750 388 Q780 383 810 388 Q840 392 870 386" strokeWidth="1.2" opacity="0.8" />
          <path d="M1000 394 Q1030 389 1060 394 Q1090 398 1120 392" strokeWidth="1.2" opacity="0.8" />
        </g>

        {/* SETTING SUN — Central focal point */}
        <g opacity="0.7">
          <circle cx="720" cy="305" r="35" strokeWidth="1.5" />
          <circle cx="720" cy="305" r="30" strokeWidth="1" opacity="0.5" />
          
          {/* Sun rays */}
          <g strokeWidth="0.8" opacity="0.4">
            <path d="M720 268 L720 250" />
            <path d="M740 275 L750 262" />
            <path d="M752 290 L767 282" />
            <path d="M755 308 L772 308" />
            <path d="M752 326 L767 334" />
            <path d="M740 338 L750 351" />
            <path d="M720 342 L720 360" />
            <path d="M700 338 L690 351" />
            <path d="M688 326 L673 334" />
            <path d="M685 308 L668 308" />
            <path d="M688 290 L673 282" />
            <path d="M700 275 L690 262" />
          </g>
          
          {/* Reflection on water */}
          <g opacity="0.3" strokeWidth="1">
            <path d="M715 340 L718 358" />
            <path d="M720 340 L720 362" />
            <path d="M725 340 L722 358" />
          </g>
        </g>

        {/* CLOUDS — Right side */}
        <g opacity="0.65" strokeWidth="1.2">
          <path d="M950 260 Q960 255 972 256 Q985 258 995 253 Q1008 255 1018 250 Q1025 252 1030 258 Q1028 265 1020 268 Q1008 270 995 268 Q982 270 970 267 Q958 269 948 265 Q945 262 947 259 Z" />
          <path d="M1050 280 Q1058 276 1068 277 Q1078 279 1086 275 Q1095 277 1103 273 Q1109 275 1113 280 Q1111 286 1104 289 Q1094 291 1084 289 Q1074 291 1065 288 Q1056 290 1049 286 Q1046 283 1048 280 Z" />
          <path d="M1120 268 Q1127 264 1136 265 Q1145 267 1152 263 Q1160 265 1167 261 Q1173 263 1176 268 Q1174 273 1168 276 Q1159 278 1150 276 Q1141 278 1133 275 Q1125 277 1119 273 Q1117 270 1119 267 Z" />
        </g>

      </g>
    </svg>
  )
}
