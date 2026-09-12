# RF Index

[RF Index](https://rfindex.com) is a web app for comparing mesh networking and
radio hardware (devices and antennas) with specs, pricing, test results, and
purchase links. It is built and maintained by the [Austin Mesh](https://www.austinmesh.org)
community.

## Meshtastic and MeshCore devices

This is the complete list of Meshtastic devices and MeshCore devices tracked by
RF Index: LoRa mesh radios, nodes, trackers, solar repeaters, and development
boards from Heltec, LilyGo, RAK Wireless, Seeed Studio, Spec5, Muzi Works, and
more. Nearly every board here runs both Meshtastic and MeshCore firmware. The
table is generated from the JSON in [`data/mesh_devices/`](data/mesh_devices/)
on every build, so it always matches the website.

<!-- devices-table:start -->
96 devices are listed, 16 of them discontinued (kept for reference, sorted last). Every row links to the device's page on RF Index,
where you will find the full specifications, purchase links, and side-by-side
comparison, and to the JSON file behind it so you can fix or extend the data.
Browse and filter the whole catalog at [www.rfindex.com/mesh/devices](https://www.rfindex.com/mesh/devices).

| Device | Description | Category | MCU | LoRa radio | Max TX | Battery | Price |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [AtlaVox Beacon Solar Node](https://www.rfindex.com/mesh/devices/atlavox-beacon-solar) <br> AtlaVox ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/atlavox-beacon-solar-meshtastic-node-atlavox.json)) | Solar node based on RAK WisBlock in an IP67 aluminum enclosure with a 5W panel. | Complete, Solar | nRF52 | SX1262 | 22 dBm | LiPo 5000 mAh | $247.00 - $300.00 |
| [RAK19007 with RAK4631](https://www.rfindex.com/mesh/devices/rak-rak19007-4631) <br> RAKwireless ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/rak19007-with-rak4631-rakwireless.json)) | Module kit based on RAK WisBlock with 4 module slots and IPEX connectors. | DIY | nRF52 | SX1262 | 22 dBm | External | $29.99 - $39.99 |
| [Mesh Node T114](https://www.rfindex.com/mesh/devices/heltec-mesh-node-t114) <br> Heltec ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/mesh-node-t114-heltec.json)) | Dev board with an optional 1.14-inch TFT and GPS module. | DIY | nRF52 | SX1262 | 22 dBm | External | $27.90 - $49.90 |
| [SenseCAP Solar Node P1 Pro](https://www.rfindex.com/mesh/devices/sensecap-solar-node-p1-pro) <br> Seeed Studio ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/sensecap-solar-node-p1-pro-seeed-studio.json)) | Solar node based on XIAO with a 5W panel, RP-SMA connector and Grove connector. | Complete, Solar | nRF52 | SX1262 | 22 dBm | 18650 Li-ion 13400 mAh | $74.99 - $140.00 |
| [AtlaVox M1](https://www.rfindex.com/mesh/devices/atlavox-m1) <br> AtlaVox ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/atlavox-m1-atlavox.json)) | Handheld based on RAK WisBlock in a 3D printed case with an optional GPS module. | Complete | nRF52 | SX1262 | 22 dBm | LiPo 2000 mAh | $76.99 - $118.96 |
| [WisMesh Tag](https://www.rfindex.com/mesh/devices/wismesh-tag) <br> RAKwireless ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/wismesh-tag-rakwireless.json)) | Card in an IP66 enclosure with an internal antenna and GNSS module. | Complete | nRF52 | SX1262 | 22 dBm | LiPo 1000 mAh | $29.00 - $49.99 |
| [T-Lora Pager](https://www.rfindex.com/mesh/devices/lilygo-t-lora-pager) <br> LilyGo ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/t-lora-pager-lilygo.json)) | Handheld with a QWERTY keyboard, 2.33-inch display and rotary encoder. | Complete, Standalone | ESP32-S3 | SX1262 | 22 dBm | LiPo 1500 mAh | $87.35 - $114.97 |
| [WisMesh Pocket V2](https://www.rfindex.com/mesh/devices/wismesh-pocket-v2) <br> RAKwireless ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/wismesh-pocket-v2-rakwireless.json)) | Handheld based on RAK WisBlock with a 1.3-inch OLED, GNSS module, and SMA connector. | Complete | nRF52 | SX1262 | 22 dBm | LiPo 3200 mAh | $89.99 - $99.99 |
| [WisMesh Repeater Mini V2](https://www.rfindex.com/mesh/devices/wismesh-repeater-mini-v2) <br> RAKwireless ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/wismesh-repeater-mini-v2-rakwireless.json)) | Solar node based on RAK WisBlock in an IP67 ABS enclosure with an RP-SMA connector. | Complete, Solar | nRF52 | SX1262 | 30 dBm | Li-ion 3200 mAh | $89.90 - $99.90 |
| [T-Echo](https://www.rfindex.com/mesh/devices/lilygo-t-echo) <br> LilyGo ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/t-echo-lilygo.json)) | Handheld in an ABS case with a 1.54-inch e-ink display. | Complete | nRF52 | SX1262 | 22 dBm | LiPo 850 mAh | $54.41 - $64.99 |
| [T-Deck](https://www.rfindex.com/mesh/devices/lilygo-t-deck) <br> LilyGo ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/t-deck-lilygo.json)) | Handheld with a QWERTY keyboard, 2.8-inch IPS LCD and trackball. | Complete, DIY, Standalone | ESP32-S3 | SX1262 | 22 dBm | LiPo | $43.08 - $94.99 |
| [SenseCAP MeshTracker X1](https://www.rfindex.com/mesh/devices/seeedstudio-sensecap-meshtracker-x1) <br> Seeed Studio ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/sensecap-meshtracker-x1-seeed-studio.json)) | Card in an IP66 enclosure with dual-band L1+L5 GNSS, a barometer and a vibration motor. | Complete | nRF52 | LR2021 | 22 dBm | Li-ion 1100 mAh | $42.90 - $49.90 |
| [SenseCAP T1000e](https://www.rfindex.com/mesh/devices/seeedstudio-sensecap-t1000e) <br> Seeed Studio ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/sensecap-t1000e-seeed-studio.json)) | Card in an IP65 enclosure with a buzzer and magnetic charging cable. | Complete | nRF52 | LR1110 | 22 dBm | Li-ion 700 mAh | $35.00 - $45.00 |
| [T-Deck Pro](https://www.rfindex.com/mesh/devices/lilygo-t-deck-pro) <br> LilyGo ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/t-deck-pro-lilygo.json)) | Handheld with a QWERTY keyboard, 3.1-inch e-ink touchscreen and 4G module option. | Complete, Standalone | ESP32-S3 | SX1262 | 22 dBm | LiPo 1400 mAh | $81.79 - $92.64 |
| [Thinknode M1](https://www.rfindex.com/mesh/devices/elecrow-thinknode-m1) <br> Elecrow ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/thinknode-m1-elecrow.json)) | Handheld in an ABS case with a 1.54-inch e-ink display and buzzer. | Complete | nRF52 | SX1262 | 22 dBm | LiPo 1200 mAh | $39.90 - $60.99 |
| [RAK19003 with RAK4631](https://www.rfindex.com/mesh/devices/rak-rak19003-4631) <br> RAKwireless ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/rak19003-with-rak4631-rakwireless.json)) | Module kit based on RAK WisBlock with 2 module slots and IPEX connectors. | DIY | nRF52 | SX1262 | 22 dBm | External | $27.99 - $37.99 |
| [3W Solar LTO Basestation](https://www.rfindex.com/mesh/devices/voltaic-enclosures-3w-solar-lto-basestation) <br> VoltaicEnclosures ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/3w-solar-lto-basestation-voltaicenclosures.json)) | Solar node with a 3W panel and N-type connector. | Complete, Solar | nRF52 | SX1262 | 22 dBm | LTO | $455.00 |
| [Base Duo](https://www.rfindex.com/mesh/devices/muzi-works-base-duo) <br> Muzi Works ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/base-duo-muzi.json)) | Dev board with SMA and U.FL connectors and a Qwiic port. | DIY | nRF52 | LR1121 | 20 dBm | External | $35.00 |
| [Base Station](https://www.rfindex.com/mesh/devices/yeti-wurks-base-station) <br> Yeti Wurks ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/yeti-wurks-base-station.json)) | Relay based on RAK WisBlock in an IP65 enclosure with an N-type connector. | Complete | nRF52 | SX1262 | 22 dBm | 18650 Li-ion | $100.00 - $125.00 |
| [Base Uno](https://www.rfindex.com/mesh/devices/muzi-works-base-uno) <br> Muzi Works ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/base-uno-muzi.json)) | Dev board with an SMA connector and Qwiic port. | DIY | nRF52 | SX1262 | 20 dBm | External | $25.00 |
| [Chatter 2](https://www.rfindex.com/mesh/devices/circuitmess-chatter-2) <br> CircuitMess ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/chatter-2-circuitmess.json)) | Module kit with a keypad, acrylic case and piezo buzzer. | DIY | ESP32 | LLCC68 | 22 dBm | LiPo | $149.00 |
| [GAT562 30s Kit](https://www.rfindex.com/mesh/devices/mtools-tec-gat562-30s-kit) <br> MTools Tec ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/gat562-30s-kit-mtools-tec.json)) | Module kit with a 1.3-inch TFT, built in filter and BME280 sensor. | DIY | nRF52 | SX1262 | 30 dBm | 18650 Li-ion 2500 mAh | $69.99 - $75.99 |
| [GAT562 30s Mesh Solar Repeater](https://www.rfindex.com/mesh/devices/mtools-tec-gat562-30s-solar-repeater) <br> MTools Tec ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/gat562-30s-solar-repeater-mtools-tec.json)) | Relay with IPEX connectors, built in filter and power amplifier. | DIY | nRF52 | SX1262 | 30 dBm | External | $39.99 - $46.99 |
| [GAT562 Mesh Solar Relay](https://www.rfindex.com/mesh/devices/mtools-tec-gat562-solar-relay) <br> MTools Tec ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/gat562-solar-relay-mtools-tec.json)) | Solar node in an IP65 enclosure with a 5W panel and GNSS module. | Complete, Solar | nRF52 | SX1262 | 22 dBm | Li-ion 5200 mAh | $89.99 - $99.99 |
| [GAT562 Mesh Tracker](https://www.rfindex.com/mesh/devices/mtools-tec-gat562) <br> MTools Tec ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/gat562-mtools-tec.json)) | Handheld with a 1.3-inch TFT and joystick. | Complete | nRF52 | SX1262 | 22 dBm | Li-ion 2500 mAh | $69.99 - $99.99 |
| [H2T](https://www.rfindex.com/mesh/devices/muzi-works-h2t-heltec-t114-gps-meshtastic) <br> Muzi Works ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/h2t-muzi.json)) | Handheld based on the Heltec T114 in a 3D printed case with a 17cm whip antenna. | Complete | nRF52 | SX1262 | 22 dBm | LiPo 2000 mAh | $99.00 |
| [Ikoka Nano](https://www.rfindex.com/mesh/devices/ikoka-nano) <br> Ikoka ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/ikoka-nano.json)) | Dev board based on XIAO. | DIY | nRF52 | SX1262 | 30 dBm | LiPo | $25.00 - $40.00 |
| [Ikoka Stick](https://www.rfindex.com/mesh/devices/ikoka-stick) <br> Ikoka ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/ikoka-stick.json)) | Dev board based on XIAO with an optional 0.96-inch OLED. | DIY | nRF52 | SX1262 | 33 dBm | Li-ion | $35.00 - $55.00 |
| [LoRa 32 V3](https://www.rfindex.com/mesh/devices/heltec-lora-32-v3) <br> Heltec ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/lora-32-v3-heltec.json)) | Dev board with a 0.96-inch OLED and IPEX connector. | DIY | ESP32-S3 | SX1262 | 22 dBm | External | $17.99 - $34.99 |
| [LoRa T3S3](https://www.rfindex.com/mesh/devices/lilygo-lora-t3s3) <br> LilyGo ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/lora-t3s3-lilygo.json)) | Dev board with a 0.96-inch display. | DIY | ESP32-S3 | SX1262 | 22 dBm | External | $23.65 - $27.99 |
| [Mesh Node T096](https://www.rfindex.com/mesh/devices/heltec-mesh-node-t096) <br> Heltec ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/mesh-node-t096-heltec.json)) | Dev board with a dual-band L1 and L5 GNSS module and IPEX connectors. | DIY | nRF52 | SX1262 | 28 dBm | External | $33.90 - $42.99 |
| [MeshPocket Qi2](https://www.rfindex.com/mesh/devices/heltec-meshpocket-qi2) <br> Heltec ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/meshpocket-qi2-heltec.json)) | Power bank with a 2.13-inch e-ink display and Qi2 wireless charging. | Complete | nRF52 | SX1262 | 22 dBm | LiPo 5000 mAh | $49.99 - $59.99 |
| [Meshtec B1](https://www.rfindex.com/mesh/devices/meshtech-b1) <br> Meshtech ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/meshtec-b1-meshtech.json)) | Handheld based on RAK WisMesh B1 in an ABS enclosure with a 1.3-inch OLED and optional SMA connector. | Complete | nRF52 | SX1262 | 22 dBm | LiPo | $60.00 - $75.00 |
| [MeshTower V2](https://www.rfindex.com/mesh/devices/heltec-meshtower-v2) <br> Heltec ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/meshtower-v2-heltec.json)) | Solar node in an IP66 aluminum enclosure with a 10W panel and SMA connector. | Complete, Solar | nRF52 | SX1262 | 30 dBm | Li-ion 8400 mAh | $109.00 - $129.00 |
| [Nano G2 Ultra](https://www.rfindex.com/mesh/devices/bq-consulting-nano-g2-ultra) <br> B&Q Consulting ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/nano-g2-ultra-bq-consulting.json)) | Handheld with a 1.3-inch OLED and internal wideband antenna. | Complete | nRF52 | SX1262 | 22 dBm | LiPo | $86.00 |
| [Pocket-S](https://www.rfindex.com/mesh/devices/lowmesh-pocket-s) <br> LowMesh ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/pocket-s-lowmesh.json)) | Solar node in a 3D printed case with a 0.8W panel and internal antennas. | Complete, Solar | nRF52 | SX1262 | 22 dBm | LiPo 2000 mAh | $79.97 |
| [R1 Neo](https://www.rfindex.com/mesh/devices/muzi-works-r1-neo) <br> Muzi Works ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/r1-neo-muzi.json)) | Handheld in an aluminum and 3D printed case with an SMA connector. | Complete | nRF52 | SX1262 | 22 dBm | LiPo 1500 mAh | $89.00 |
| [SenseCAP Indicator](https://www.rfindex.com/mesh/devices/seeedstudio-sensecap-indicator) <br> Seeed Studio ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/sensecap-indicator-seeed-studio.json)) | Desktop unit with a 3.95-inch touchscreen and CO2 and tVOC sensors, USB powered. | Complete | ESP32-S3 | SX1262 | 21 dBm | None | $49.00 - $89.00 |
| [Spec5 Beacon](https://www.rfindex.com/mesh/devices/spec5-beacon) <br> SpecFive ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/spec5-beacon-specfive.json)) | Solar node in a PETG case with a ceramic GPS antenna. | Complete, Solar | ARM Cortex-M4 |  | 22 dBm | 18650 Li-ion | $179.99 |
| [Spec5 Copilot](https://www.rfindex.com/mesh/devices/spec5-copilot) <br> SpecFive ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/spec5-copilot-specfive.json)) | Relay in a PETG case with drone mounting hardware. | Complete | ESP32-S3 | SX1262 | 22 dBm | LiPo 1300 mAh | $139.99 |
| [Spec5 MeshClip](https://www.rfindex.com/mesh/devices/spec5-meshclip) <br> SpecFive ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/spec5-meshclip-specfive.json)) | Handheld in a PETG case with a magnetic phone mount, USB-C powered. | Complete | ESP32-S3 | SX1262 | 22 dBm | External | $79.99 |
| [Spec5 MiniTrekker](https://www.rfindex.com/mesh/devices/spec5-minitrekker) <br> SpecFive ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/spec5-minitrekker-specfive.json)) | Handheld in a PETG case with a ceramic GPS antenna. | Complete | ESP32 | SX1262 | 22 dBm | LiPo 1200 mAh | $69.99 |
| [Spec5 Nomad 2](https://www.rfindex.com/mesh/devices/spec5-nomad-2) <br> SpecFive ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/spec5-nomad-2-specfive.json)) | Handheld based on Raspberry Pi in a PETG case with a 5.0-inch touchscreen, tactile keyboard, and Ethernet. | Complete, Standalone | Raspberry Pi 5 | SX1262 |  | 18650 Li-ion | $549.99 - $679.99 |
| [Spec5 Ranger](https://www.rfindex.com/mesh/devices/spec5-ranger) <br> SpecFive ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/spec5-ranger-specfive.json)) | Handheld in a PETG case with a QWERTY keyboard and trackball. | Complete, Standalone | ESP32-S3 |  | 22 dBm | LiPo 3300 mAh | $179.99 |
| [Spec5 Relay](https://www.rfindex.com/mesh/devices/spec5-relay) <br> SpecFive ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/spec5-relay-specfive.json)) | Relay based on RAK WisBlock in an IP67 PETG enclosure with a 12W panel and 8 dBi fiberglass antenna. | Complete, Solar | ARM Cortex-M4 |  | 22 dBm | 18650 Li-ion | $274.99 |
| [Spec5 Spectre MKII](https://www.rfindex.com/mesh/devices/spec5-spectre-mkii) <br> SpecFive ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/spec5-spectre-mkii-specfive.json)) | Handheld in a PETG case with a 3.0-inch touchscreen. | Complete, Standalone | ESP32-S3 | SX1262 | 28 dBm | LiPo 1200 mAh | $149.99 |
| [Spec5 Spectre Pro](https://www.rfindex.com/mesh/devices/spec5-spectre-pro) <br> SpecFive ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/spec5-spectre-pro-specfive.json)) | Handheld in a carbon fiber reinforced PETG case with a 3.88-inch touchscreen and optional GNSS module. | Complete, Standalone | nRF52 | SX1262 |  | LiPo 250 mAh | $209.99 - $309.99 |
| [Spec5 Trekker BRAVO](https://www.rfindex.com/mesh/devices/spec5-trekker-bravo) <br> SpecFive ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/spec5-trekker-bravo-specfive.json)) | Handheld in a PETG case. | Complete | ESP32 | SX1262 | 22 dBm | 18650 Li-ion | $119.99 |
| [Station G3](https://www.rfindex.com/mesh/devices/bq-consulting-station-g3) <br> B&Q Consulting ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/station-g3-bq-consulting.json)) | Dev board with a 1.3-inch OLED, power amplifier and LNA, USB PD powered. | DIY | ESP32-S3 | SX1262 | 35 dBm | External | $109.00 - $159.00 |
| [T-Beam Supreme](https://www.rfindex.com/mesh/devices/lilygo-t-beam-supreme) <br> LilyGo ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/t-beam-supreme-lilygo.json)) | Dev board with a GPS module, six-axis IMU and SMA connector. | DIY | ESP32-S3 | SX1262 | 22 dBm | External | $47.32 - $64.99 |
| [T-Beam V1.1](https://www.rfindex.com/mesh/devices/lilygo-t-beam-v1-1) <br> LilyGo ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/t-beam-v1-1-lilygo.json)) | Dev board with a 0.96-inch OLED and GPS module. | DIY | ESP32 | SX1276 | 20 dBm | 18650 Li-ion | $30.77 - $34.99 |
| [T-Deck Plus](https://www.rfindex.com/mesh/devices/lilygo-t-deck-plus) <br> LilyGo ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/t-deck-plus-lilygo.json)) | Handheld with a QWERTY keyboard, 2.8-inch touchscreen and trackball. | Complete | ESP32-S3 | SX1262 | 22 dBm | LiPo 2000 mAh | $79.00 - $99.97 |
| [T-Lora C6](https://www.rfindex.com/mesh/devices/lilygo-t-lora-c6) <br> LilyGo ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/t-lora-c6-lilygo.json)) | Dev board with an FPC antenna. | DIY | ESP32 | SX1262 | 22 dBm | External | $18.00 - $24.99 |
| [T-Watch](https://www.rfindex.com/mesh/devices/lilygo-t-watch) <br> LilyGo ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/t-watch-lilygo.json)) | Watch with a microphone, speaker and haptic motor. | Complete, Standalone | ESP32-S3 | SX1262 | 22 dBm | LiPo | $39.99 - $54.99 |
| [Thinknode M2](https://www.rfindex.com/mesh/devices/elecrow-thinknode-m2) <br> Elecrow ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/thinknode-m2-elecrow.json)) | Handheld in an ABS case with a 1.3-inch OLED and buzzer. | Complete | ESP32-S3 | SX1262 | 22 dBm | LiPo 1000 mAh | $25.99 - $46.99 |
| [Thinknode M3](https://www.rfindex.com/mesh/devices/elecrow-thinknode-m3) <br> Elecrow ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/thinknode-m3-elecrow.json)) | Card in an IP66 enclosure with an internal antenna and temperature, humidity and accelerometer sensors. | Complete | nRF52 | LR1110 | 20 dBm | LiPo 770 mAh | $42.99 - $44.99 |
| [Thinknode M4](https://www.rfindex.com/mesh/devices/elecrow-thinknode-m4) <br> Elecrow ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/thinknode-m4-elecrow.json)) | Power bank with a built in radio, wireless charging, and temperature and humidity sensors. | Complete | nRF52 | LR1110 | 22 dBm | 18650 Li-ion 7000 mAh | $69.99 |
| [Thinknode M5](https://www.rfindex.com/mesh/devices/elecrow-thinknode-m5) <br> Elecrow ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/thinknode-m5-elecrow.json)) | Handheld in an ABS case with a 1.54-inch e-ink display, rotary encoder, and RP-SMA connector. | Complete | ESP32-S3 | SX1262 | 22 dBm | LiPo 1200 mAh | $53.90 - $63.99 |
| [Thinknode M6](https://www.rfindex.com/mesh/devices/elecrow-thinknode-m6) <br> Elecrow ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/thinknode-m6-elecrow.json)) | Solar node in an IP65 enclosure with a 6W panel and RP-SMA connectors. | Complete, Solar | nRF52 | SX1262 | 22 dBm | 18650 Li-ion 7000 mAh | $79.90 - $89.99 |
| [Vision Master E213](https://www.rfindex.com/mesh/devices/heltec-vision-master-e213) <br> Heltec ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/vision-master-e213-heltec.json)) | Dev board with a 2.13-inch e-ink display and IPEX connectors. | DIY | ESP32-S3 | SX1262 | 22 dBm | External | $18.90 - $29.90 |
| [Vision Master E290](https://www.rfindex.com/mesh/devices/heltec-vision-master-e290) <br> Heltec ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/vision-master-e290-heltec.json)) | Dev board with a 2.9-inch e-ink display and IPEX connectors. | DIY | ESP32-S3 | SX1262 | 22 dBm | External | $29.97 - $39.99 |
| [Vision Master T190](https://www.rfindex.com/mesh/devices/heltec-vision-master-t190) <br> Heltec ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/vision-master-t190-heltec.json)) | Dev board with a 1.9-inch TFT, optional LoRa module, and IPEX connectors. | DIY | ESP32-S3 | SX1262 | 22 dBm | External | $17.90 - $24.97 |
| [WiFi LoRa 32 V4](https://www.rfindex.com/mesh/devices/heltec-lora-32-v4) <br> Heltec ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/lora-32-v4-heltec.json)) | Dev board with an optional OLED and GNSS module connector. | DIY | ESP32-S3 | SX1262 | 28 dBm | External | $17.90 - $29.99 |
| [Wio SX1262 with XIAO ESP32S3](https://www.rfindex.com/mesh/devices/seeedstudio-wio-sx1262-xiao-esp32s3) <br> Seeed Studio ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/wio-sx1262-with-xiao-esp32s3-seeed-studio.json)) | Dev board based on XIAO with IPEX connectors and an optional GNSS module. | DIY | ESP32-S3 | SX1262 | 22 dBm | External | $10.36 - $18.99 |
| [Wio SX1262 with XIAO nRF52840](https://www.rfindex.com/mesh/devices/seeedstudio-wio-sx1262-xiao-nrf52840) <br> Seeed Studio ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/wio-sx1262-with-xiao-nrf52840-seeed-studio.json)) | Dev board based on XIAO with an IPEX connector and an optional GNSS module. | DIY | nRF52 | SX1262 | 22 dBm | External | $12.82 - $19.08 |
| [Wio Tracker 1110](https://www.rfindex.com/mesh/devices/seeedstudio-wio-tracker-1110) <br> Seeed Studio ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/wio-tracker-1110-seeed-studio.json)) | Dev board based on WM1110 with a temperature and humidity sensor, accelerometer, and Grove connectors. | DIY | nRF52 | LR1110 | 20 dBm | External | $29.00 - $39.00 |
| [Wio Tracker L1](https://www.rfindex.com/mesh/devices/seeedstudio-wio-tracker-l1) <br> Seeed Studio ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/wio-tracker-l1-seeed-studio.json)) | Dev board with a 1.3-inch OLED and Grove connector. | DIY | nRF52 | SX1262 | 22 dBm | LiPo | $25.00 - $35.00 |
| [Wio Tracker L1 E-Ink](https://www.rfindex.com/mesh/devices/seeedstudio-wio-tracker-l1-e-ink) <br> Seeed Studio ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/wio-tracker-l1-e-ink-seeed-studio.json)) | Dev board with a 2.13-inch e-ink display and Grove connector. | DIY | nRF52 | SX1262 | 22 dBm | LiPo | $30.00 - $40.00 |
| [Wio Tracker L1 Lite](https://www.rfindex.com/mesh/devices/seeedstudio-wio-tracker-l1-lite) <br> Seeed Studio ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/wio-tracker-l1-lite-seeed-studio.json)) | Dev board with a Grove connector. | DIY | nRF52 | SX1262 | 22 dBm | LiPo | $20.00 - $30.00 |
| [Wio Tracker L1 Pro](https://www.rfindex.com/mesh/devices/seeedstudio-wio-tracker-l1-pro) <br> Seeed Studio ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/wio-tracker-l1-pro-seeed-studio.json)) | Handheld with a 1.3-inch OLED and 3 dBi antenna. | Complete | nRF52 | SX1262 | 22 dBm | LiPo 2000 mAh | $39.90 - $46.99 |
| [Wio-WM1110 Dev Kit](https://www.rfindex.com/mesh/devices/seeedstudio-wio-wm1110-dev-kit) <br> Seeed Studio ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/wio-wm1110-dev-kit-seeed-studio.json)) | Dev board based on WM1110 with a temperature and humidity sensor, accelerometer, and Grove connectors. | DIY | nRF52 | LR1110 | 20 dBm | External | $32.00 - $49.00 |
| [Wireless Paper V1.1](https://www.rfindex.com/mesh/devices/heltec-wireless-paper-v1-1) <br> Heltec ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/wireless-paper-v1-1-heltec.json)) | Dev board with a 2.13-inch e-ink display. | DIY | ESP32-S3 | SX1262 | 22 dBm | External | $22.90 - $25.99 |
| [Wireless Stick Lite V3](https://www.rfindex.com/mesh/devices/heltec-wireless-stick-lite-v3) <br> Heltec ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/wireless-stick-lite-v3-heltec.json)) | Dev board. | DIY | ESP32-S3 | SX1262 | 22 dBm | External | $14.90 - $32.99 |
| [Wireless Tracker V1.1](https://www.rfindex.com/mesh/devices/heltec-wireless-tracker-v1-1) <br> Heltec ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/wireless-tracker-v1-1-heltec.json)) | Dev board with a 0.96-inch TFT and GNSS receiver. | DIY | ESP32-S3 | SX1262 | 22 dBm | External | $22.99 - $32.99 |
| [WisMesh 1W Booster Starter Kit](https://www.rfindex.com/mesh/devices/wismesh-1w-booster) <br> RAKwireless ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/wismesh-1w-booster-rakwireless.json)) | Module kit based on RAK WisBlock with a power amplifier and built in filter. | DIY | nRF52 | SX1262 | 30 dBm | External | $39.00 |
| [WisMesh Board ONE](https://www.rfindex.com/mesh/devices/wismesh-board-one) <br> RAKwireless ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/wismesh-board-one-rakwireless.json)) | Dev board with an optional 1.3-inch OLED, GNSS module, and a sensor slot. | DIY | nRF52 | SX1262 | 22 dBm | External | $29.97 - $53.99 |
| [WisMesh Ethernet MQTT Gateway](https://www.rfindex.com/mesh/devices/wismesh-ethernet-mqtt-gateway) <br> RAKwireless ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/wismesh-ethernet-mqtt-gateway-rakwireless.json)) | Gateway based on RAK WisBlock with Ethernet, optional PoE, and an RP-SMA connector. | Complete | nRF52 | SX1262 | 22 dBm | None | $43.00 - $114.00 |
| [WisMesh Repeater](https://www.rfindex.com/mesh/devices/wismesh-repeater) <br> RAKwireless ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/wismesh-repeater-rakwireless.json)) | Relay based on RAK WisBlock in an IP67 enclosure with an RP-SMA connector and optional 10W panel. | Complete | nRF52 | SX1262 | 22 dBm | Li-ion 5200 mAh | $99.99 - $324.99 |
| [WisMesh Tap V2](https://www.rfindex.com/mesh/devices/wismesh-tap-v2) <br> RAKwireless ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/wismesh-tap-v2-rakwireless.json)) | Handheld based on RAK WisBlock in an IP65 enclosure with a 320x240 TFT touchscreen, on-screen keyboard, and offline map storage. | Complete, Standalone | ESP32-S3 | SX1262 |  | LiPo 3200 mAh | $119.97 |
| [WisMesh WiFi MQTT Gateway V2](https://www.rfindex.com/mesh/devices/wismesh-wifi-mqtt-gateway-v2) <br> RAKwireless ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/wismesh-wifi-mqtt-gateway-v2-rakwireless.json)) | Gateway based on RAK WisBlock with an RP-SMA connector, optional IP65 enclosure. | Complete | ESP32-S3 | SX1262 |  | None | $34.00 - $68.00 |
| [WisMesh Repeater Mini](https://www.rfindex.com/mesh/devices/wismesh-repeater-mini) <br> RAKwireless ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/wismesh-repeater-mini-rakwireless.json)) <br> *Discontinued, replaced by [WisMesh Repeater Mini V2](https://www.rfindex.com/mesh/devices/wismesh-repeater-mini-v2)* | Solar node based on RAK WisBlock in an IP67 enclosure with an RP-SMA connector. | Complete, Solar | nRF52 | SX1262 | 22 dBm | Li-ion 3200 mAh | $99.99 |
| [BASENODE](https://www.rfindex.com/mesh/devices/pacific-nw-3d-basenode) <br> Pacific Northwest 3D ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/basenode-pacific-northwest-3d.json)) <br> *Discontinued* | Handheld based on the Heltec V3 in a 3D printed case. | Complete | ESP32-S3 | SX1262 | 22 dBm | LiPo | $70.00 |
| [Canary One](https://www.rfindex.com/mesh/devices/canary-radio-canary-one) <br> Canary Radio Co. ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/canary-one-canary-radio.json)) <br> *Discontinued* | Handheld with an SMA connector. | Complete | nRF52 | SX1262 | 22 dBm | LiPo 1200 mAh | $160.00 |
| [H1](https://www.rfindex.com/mesh/devices/muzi-works-h1-heltec-v3) <br> Muzi Works ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/h1-muzi.json)) <br> *Discontinued* | Handheld based on the Heltec V3 in a 3D printed case. | Complete | ESP32-S3 | SX1262 | 22 dBm | LiPo | $65.00 |
| [H1 with External Antenna](https://www.rfindex.com/mesh/devices/muzi-works-h1-heltec-v3-whip-antenna) <br> Muzi Works ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/h1-with-external-antenna-muzi.json)) <br> *Discontinued* | Handheld based on the Heltec V3 in a 3D printed case with a whip antenna. | Complete | ESP32-S3 | SX1262 | 22 dBm | LiPo | $75.00 |
| [NOMAD Device w/ Meshtastic®](https://www.rfindex.com/mesh/devices/pacific-nw-3d-nomad-heltec-v3) <br> Pacific Northwest 3D ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/nomad-device-w-meshtastic-pacific-northwest-3d.json)) <br> *Discontinued* | Handheld based on the Heltec V3 with an SMA connector. | Complete | ESP32 |  | 22 dBm | LiPo | $70.00 |
| [R1](https://www.rfindex.com/mesh/devices/muzi-works-r1) <br> Muzi Works ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/r1-muzi.json)) <br> *Discontinued, replaced by [R1 Neo](https://www.rfindex.com/mesh/devices/muzi-works-r1-neo)* | Handheld based on RAK WisBlock in a 3D printed case with internal antennas. | Complete | nRF52 |  | 22 dBm | LiPo | $79.00 |
| [R1 with External Antenna](https://www.rfindex.com/mesh/devices/muzi-works-r1-external-antenna) <br> Muzi Works ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/r1-with-external-antenna-muzi.json)) <br> *Discontinued, replaced by [R1 Neo](https://www.rfindex.com/mesh/devices/muzi-works-r1-neo)* | Handheld based on RAK4631 in a 3D printed case with an SMA connector. | Complete | nRF52 |  | 22 dBm | LiPo | $89.00 |
| [Spec5 Nomad](https://www.rfindex.com/mesh/devices/spec5-nomad) <br> SpecFive ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/spec5-nomad-specfive.json)) <br> *Discontinued, replaced by [Spec5 Nomad 2](https://www.rfindex.com/mesh/devices/spec5-nomad-2)* | Handheld based on Raspberry Pi with a 5-inch touchscreen, tactile keyboard and Ethernet. | Complete, Standalone | Raspberry Pi 5 |  | 22 dBm | LiPo | $399.99 |
| [Spec5 Spectre](https://www.rfindex.com/mesh/devices/spec5-spectre) <br> SpecFive ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/spec5-spectre-specfive.json)) <br> *Discontinued, replaced by [Spec5 Spectre MKII](https://www.rfindex.com/mesh/devices/spec5-spectre-mkii)* | Handheld with a 2.5-inch screen. | Complete, Standalone | ESP32 |  | 22 dBm | LiPo | $144.99 |
| [Spec5 Trekker](https://www.rfindex.com/mesh/devices/spec5-trekker) <br> SpecFive ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/spec5-trekker-specfive.json)) <br> *Discontinued, replaced by [Spec5 Trekker BRAVO](https://www.rfindex.com/mesh/devices/spec5-trekker-bravo)* | Handheld. | Complete | ESP32 |  | 22 dBm | LiPo | $119.99 |
| [Spec5 Trekker Utility](https://www.rfindex.com/mesh/devices/spec5-trekker-utility) <br> SpecFive ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/spec5-trekker-utility-specfive.json)) <br> *Discontinued* | Handheld. | Complete | ESP32 |  | 22 dBm | LiPo | $139.99 |
| [Station G2](https://www.rfindex.com/mesh/devices/bq-consulting-station-g2) <br> B&Q Consulting ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/station-g2-bq-consulting.json)) <br> *Discontinued, replaced by [Station G3](https://www.rfindex.com/mesh/devices/bq-consulting-station-g3)* | Desktop unit with a power amplifier and LNA, 1.3-inch OLED, USB PD powered. | Complete | ESP32-S3 | SX1262 | 37 dBm | External | $109.00 |
| [WisMesh Pocket Mini](https://www.rfindex.com/mesh/devices/wismesh-pocket-mini) <br> RAKwireless ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/wismesh-pocket-mini-rakwireless.json)) <br> *Discontinued, replaced by [WisMesh Tag](https://www.rfindex.com/mesh/devices/wismesh-tag)* | Handheld based on RAK WisBlock in a 3D printed case with an internal antenna. | Complete | nRF52 | SX1262 | 22 dBm | LiPo 1000 mAh | $49.99 - $59.99 |
| [WisMesh Tap](https://www.rfindex.com/mesh/devices/wismesh-tap) <br> RAKwireless ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/wismesh-tap-rakwireless.json)) <br> *Discontinued, replaced by [WisMesh Tap V2](https://www.rfindex.com/mesh/devices/wismesh-tap-v2)* | Handheld based on RAK WisBlock in an IP65 enclosure with a 320x240 TFT touchscreen and GNSS module. | Complete, Standalone | nRF52 | SX1262 | 22 dBm | LiPo 3200 mAh | $109.00 - $109.99 |
| [WisMesh WiFi MQTT Gateway](https://www.rfindex.com/mesh/devices/wismesh-wifi-mqtt-gateway) <br> RAKwireless ([edit](https://github.com/austinmesh/rfindex/edit/main/data/mesh_devices/wismesh-wifi-mqtt-gateway-rakwireless.json)) <br> *Discontinued, replaced by [WisMesh WiFi MQTT Gateway V2](https://www.rfindex.com/mesh/devices/wismesh-wifi-mqtt-gateway-v2)* | Gateway based on RAK WisBlock with an RP-SMA connector, optional IP65 enclosure. | Complete | ESP32 | SX1262 | 22 dBm | External | $34.00 - $68.00 |
<!-- devices-table:end -->

## Tech stack

- **Framework:** Next.js 15 (App Router) with React 19 and TypeScript
- **Styling:** Tailwind CSS with shadcn/ui (Radix primitives)
- **Charts:** Recharts
- **Content:** Decap CMS (Git-based, local) for editing `data/`, validated against JSON Schema with AJV
- **Deployment:** Cloudflare Workers via the OpenNext adapter
- **Package manager:** pnpm

The site runs entirely within the Cloudflare free tier. Please do not introduce
features or dependencies that require paid services.

## Local development

```bash
pnpm install
pnpm dev      # generate device + antenna data, then start the dev server
```

Other useful commands:

```bash
pnpm build     # production build via OpenNext (also the main verification step)
pnpm preview   # build and run the Worker locally (closest to production)
pnpm lint      # run ESLint
pnpm validate  # check every data JSON file against its schema
pnpm cms       # start the Decap CMS local backend (run alongside pnpm dev)
```

There is no unit test suite. A clean `pnpm build` is the verification step: it
regenerates data, statically renders every device and antenna page, and
type-checks the full render tree.

## How the data works

All content lives in the `data/` directory as JSON, plus images:

- `data/mesh_devices/` - device JSON files and images
- `data/mesh_antennas/` - antenna JSON files and images

At build time, `lib/prebuild.ts` reads this JSON, generates the typed arrays the
app imports, and copies images into `public/`. The generated files are not
committed; they are rebuilt from `data/` on every build. The same step rewrites
the [device table](#meshtastic-and-meshcore-devices) at the top of this README,
which is committed, so a device change shows up as a README diff too.

Each collection has a JSON Schema in `data/schemas/`. Run `pnpm validate` to check
every file against its schema; a GitHub Action runs the same check on every PR.

For why the data is compiled to TypeScript at build time rather than read from
`data/` directly, see [Design notes and tradeoffs](#design-notes-and-tradeoffs).

## Contributing

There are three ways to contribute:

### 1. Open an issue (no code)

The easiest way to suggest a change is to
[open an issue](https://github.com/austinmesh/rfindex/issues/new/choose) using
one of the templates:

- **Add a device or antenna** - suggest new hardware to list
- **Remove a device or antenna** - flag something that should come off
- **Report an issue** - incorrect data, a broken link, or a website bug
- **Request an update** - pricing, specs, or links that need refreshing
- **Submit antenna test data** - share a VNA sweep (VSWR / return loss) for a
  listed antenna

### 2. Edit data through the CMS

The repo includes a local [Decap CMS](https://decapcms.org) for editing `data/`
through a web UI instead of hand-editing JSON.

```bash
pnpm dev
pnpm cms
```

Then open `http://localhost:3000/admin/index.html`. Changes are written straight
to the `data/` JSON and images in your working tree, so you commit and open a PR
the same as any other change. The CMS is local-only today: the live `/admin` URL
exists but cannot authenticate yet.

### 3. Open a pull request by hand

To add or edit data directly in JSON:

**Add a device**

1. Copy an existing file in `data/mesh_devices/` as your starting point. Every
   field is defined in [`data/schemas/mesh_devices.json`](data/schemas/mesh_devices.json);
   the `id` field becomes the URL slug (`/mesh/devices/<id>`).
2. Add the product image to `data/mesh_devices/images/` as WebP, and reference
   it by bare filename in the `image` field (the same rule as antennas; a full
   `/devices/...` path also works, and is what the CMS writes).
3. The `manufacturer` field and every `purchase_urls[].supplier` hold
   reference-collection slugs, not display names (`"manufacturer": "lilygo"`,
   not `"LilyGo"`). For a new brand, add the reference file (with `title` and
   `slug`) to `data/mesh_manufacturers/` or `data/suppliers/` in the same PR.
4. For stores with a referral program, use the referral link format documented
   in [`AFFILIATES.md`](AFFILIATES.md) when adding purchase URLs.

A minimal complete device, covering every required field:

```json
{
  "id": "acme-mesh-node",
  "title": "Acme Mesh Node",
  "manufacturer": "acme",
  "model": "Mesh Node v1",
  "description": "A compact ESP32-S3 LoRa node with a 1000 mAh battery.",
  "image": "acme-mesh-node.webp",
  "category": ["Complete"],
  "features": ["Bluetooth"],
  "purchase_urls": [
    { "supplier": "rokland", "url": "https://store.rokland.com/products/acme-mesh-node" }
  ],
  "price": { "min": 39.99, "max": 44.99, "currency": "USD" },
  "specifications": {
    "lora_frequencies": ["915 MHz"],
    "microcontroller": "ESP32-S3",
    "lora_radio": "SX1262",
    "power_consumption": "Low",
    "battery": { "type": "LiPo", "capacity_mAh": 1000 },
    "antenna": "External via SMA connector",
    "interfaces": ["USB-C", "Bluetooth Low Energy (BLE)"]
  }
}
```

If something is off, `pnpm validate` names the exact file and field that is
wrong, and if you write a display name where a slug belongs it suggests the
slug.

The `description` is one factual sentence in a fixed shape:
`<form factor> [based on <base board>] [in <enclosure>] [with <hardware, up to 3 items>].`
For example `Handheld based on the Heltec V3 in a 3D printed case.` or
`Dev board with an optional 1.14-inch TFT and GPS module.` Form factor is one
of Dev board, Module kit, Handheld, Card, Wearable, Watch, Desktop unit, Solar
node, Relay, Gateway, Power bank, Booster. Only mention what has no field of
its own (base board, enclosure, display size, keyboard type, panel wattage,
antenna connector, sensors); the MCU, radio, TX power, battery, category, and
features are already structured, and marketing words, use cases, runtime
claims, and firmware names stay out.

If a product is no longer sold, keep its file and set `"discontinued": true`.
If there is a successor, add it as its own device and set
`"replaced_by": "<successor id>"` on the old one; the site labels the old
device, links to the new one, and sorts discontinued devices last.

When filling in the `features` array, reuse the values existing devices
already use (match spelling and casing exactly). The feature list is kept
deliberately short: it powers the filter checkboxes on the devices page, so
every new value lengthens and fragments that list. Only introduce a new
feature when it is genuinely needed, applies to more than one device, and does
not duplicate an existing value. Adding one should be a careful, reviewed
decision, not a quick addition. Put the LoRa radio in
`specifications.lora_radio`, not in `features`, and note that `Solar` (a
built-in panel) and `Solar Input` (you can connect one) are different.

**Add an antenna**

1. Add a JSON file to `data/mesh_antennas/` named after its `slug` field. Every
   field is defined in [`data/schemas/mesh_antennas.json`](data/schemas/mesh_antennas.json).
2. Add the antenna image to `data/mesh_antennas/images/` as WebP, and
   reference it by bare filename in the `image` field.
3. To include VSWR / return-loss test data, capture a Touchstone `.s1p` sweep
   with a VNA and add it under `data/mesh_antennas/touchstone/`. See
   [`data/mesh_antennas/touchstone/README.md`](data/mesh_antennas/touchstone/README.md)
   for how to capture a sweep (microSD or NanoVNASaver) and name the file.

**Before you open the PR**

- For data changes, run `pnpm validate` to check your JSON against the schemas.
- Run `pnpm build` locally and confirm it completes without errors.
- If you added or changed a device, the build also updates the device table in
  `README.md`. Commit that change with your PR (CI flags a stale table).
- Leave any existing purchase or affiliate URL parameters intact. These fund the
  site's hosting; do not strip or alter them.
- Do not commit secrets, tokens, or `.env` files.

By opening a pull request you agree that your contribution is licensed under
the same terms as the project (inbound = outbound): code under the PolyForm
Noncommercial License 1.0.0 and data under CC BY-NC-SA 4.0. See
[License](#license) below.

However you contribute, new devices and antennas appear automatically in
listings, detail pages, and the sitemap after the next build.

## Design notes and tradeoffs

A few architectural choices are deliberate. They are recorded here so they are
not "simplified" away without weighing the cost.

### Why data is compiled to TypeScript at build time

`lib/prebuild.ts` does two jobs on every build: it transforms the per-file JSON
in `data/` into generated TypeScript arrays (`data/devices-generated.ts`,
`data/antennas-generated.ts`), and it copies images from `data/.../images/` into
`public/`.

The generated arrays are not just a convenience. The client filter components
(`device-filters.tsx`, `antenna-filters.tsx`) import derived constants
(`allFeatures`, `allLoraFrequencies`, and so on) from `lib/data.ts`, which means
`lib/data.ts` is bundled for the browser. A generated array is a pure data
literal, so `lib/data.ts` can compute those constants without importing `fs` or
`path`. If `lib/data.ts` read the JSON directly with `fs`, the client build would
fail with `Can't resolve 'fs'`. The codegen is what keeps the data importable
from both server and client.

Images are copied into `public/` because `data/` is not a served directory on
Cloudflare Workers (static assets are served from `public/`). Keeping the source
images under `data/.../images/`, next to their JSON, keeps the licensed data (see
[data/LICENSE.md](data/LICENSE.md)) as one self-contained unit and matches where
the CMS writes uploads.

**Accepted tradeoff:** the cost is a prebuild step, two gitignored generated
files, and a `tsx lib/prebuild.ts &&` prefix on `pnpm dev`. In exchange we get a
clean client/server data boundary and data plus images colocated under `data/`.

**Possible future simplification:** the prebuild could be removed entirely by
(1) pointing the CMS `media_folder` at `public/`, (2) making `lib/data.ts`
server-only and reading the JSON directly, and (3) passing the derived constants
into the filter components as props instead of importing them. This is a real
refactor, not a deletion: it moves images out of `data/` (which fragments the
colocated, separately licensed data and means hand-PR contributors touch two
trees) and reworks the client boundary. The half-measure, dropping the codegen
but keeping images in `data/`, is the worst of both: it still needs the script
for image staging and still requires the client refactor. If this is ever done,
do it all at once, not halfway.

### Validation runs in CI, not as a pre-commit hook

`pnpm validate` checks every data file against its JSON Schema. It runs in GitHub
Actions on every PR that touches `data/`, `data/schemas/`, or the validator. There is
intentionally no pre-commit hook. CI is the authoritative gate because it covers
every contribution path, including edits made through the GitHub web UI, runs
server-side, and cannot be skipped or forgotten. A pre-commit hook would only
help contributors editing locally with the hook installed, and is bypassable with
`--no-verify`, so it would add a dependency without being a real guarantee.

## License

RF Index is dual licensed because the code and the data have different terms.
Both are noncommercial: you may not sell, or charge for the use of, the code or
the data.

- **Code** is licensed under the
  [PolyForm Noncommercial License 1.0.0](LICENSE). You may use, modify, and
  share the source for any noncommercial purpose.
- **Data** (everything under `data/`, including specs, pricing, test results, and
  images) is licensed under
  [Creative Commons Attribution-NonCommercial-ShareAlike 4.0](data/LICENSE.md).

For commercial licensing, contact the maintainers.
