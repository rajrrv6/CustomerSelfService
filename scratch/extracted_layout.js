1171: ;
1172: ;
1173: ;
1174: ;
1175: ;
1176: ;
1177: function CustomerPortalLayout({ activeSubScreen, setActiveSubScreen }) {
1178:     const { tickets, createTicket, addAuditLog, lang, role } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$context$2f$AppContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useApp"])();
1179:     const t = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$i18n$2f$translations$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["translations"][lang];
1180:     const { pushToast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$feedback$2f$PostChatToasts$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFeedbackToasts"])();
1181:     const { alerts } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$stores$2f$notifications$2f$notificationStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNotificationStore"])();
1182:     // RBAC: Governance features visible to admin roles only
1183:     // (super_admin and client_admin per the UserRole type definition)
1184:     const canAccessGovernance = role === 'super_admin' || role === 'client_admin';
1185:     // ----------------------------------------------------
1186:     // Session Inactivity Timer (Phase 5)
1187:     // ----------------------------------------------------
1188:     const [sessionTimeLeft, setSessionTimeLeft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(900);
1189:     const [showTimeoutModal, setShowTimeoutModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
1190:     (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
1191:         const interval = setInterval(()=>{
1192:             setSessionTimeLeft((prev)=>{
1193:                 if (prev <= 1) {
1194:                     clearInterval(interval);
1195:                     setShowTimeoutModal(false);
1196:                     addAuditLog('User security session expired automatically due to inactivity.', 'failed');
1197:                     setActiveSubScreen('customer_system_403');
1198:                     return 0;
1199:                 }
1200:                 if (prev === 121) {
1201:                     setShowTimeoutModal(true);
1202:                 }
1203:                 return prev - 1;
1204:             });
1205:         }, 1000);
1206:         const resetTimer = ()=>{
1207:             setSessionTimeLeft((prev)=>{
1208:                 if (prev <= 120) return prev;
1209:                 return 900;
1210:             });
1211:         };
1212:         const events = [
1213:             'mousemove',
1214:             'keydown',
1215:             'click',
1216:             'scroll',
1217:             'touchstart'
1218:         ];
1219:         events.forEach((ev)=>window.addEventListener(ev, resetTimer));
1220:         return ()=>{
1221:             clearInterval(interval);
1222:             events.forEach((ev)=>window.removeEventListener(ev, resetTimer));
1223:         };
1224:     }, [
1225:         setActiveSubScreen,
1226:         addAuditLog
1227:     ]);
1228:     // ----------------------------------------------------
1229:     // Governance Dropdown State (Phase 5)
1230:     // ----------------------------------------------------
1231:     const [isGovernanceMenuOpen, setIsGovernanceMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
1232:     const governanceMenuRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
1233:     (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
1234:         const handleOutsideClick = (e)=>{
1235:             if (governanceMenuRef.current && !governanceMenuRef.current.contains(e.target)) {
1236:                 setIsGovernanceMenuOpen(false);
1237:             }
1238:         };
1239:         document.addEventListener('mousedown', handleOutsideClick);
1240:         return ()=>document.removeEventListener('mousedown', handleOutsideClick);
1241:     }, []);
1242:     // Global Search State
1243:     const [globalSearchOpen, setGlobalSearchOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
1244:     const [accentColor, setAccentColor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('blue');
1245:     const [callbackQueued, setCallbackQueued] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
1246:     const [showCsatModal, setShowCsatModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
1247:     const [showNpsModal, setShowNpsModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
1248:     // ----------------------------------------------------
1249:     // State Hooks
1250:     // ----------------------------------------------------
1251:     const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
1252:     const [kbCategoryFilter, setKbCategoryFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('All');
1253:     const [selectedArticleId, setSelectedArticleId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
1254:     const [selectedTicketId, setSelectedTicketId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
1255:     const [articleFeedbackGiven, setArticleFeedbackGiven] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
1256:     // Search suggestion dropdown states (AI Search UX Improvements)
1257:     const [searchFocused, setSearchFocused] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
1258:     const [debouncedSearchQuery, setDebouncedSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
1259:     const [searchFocusIndex, setSearchFocusIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(-1);
1260:     const searchContainerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
1261:     (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
1262:         const handler = setTimeout(()=>{
1263:             setDebouncedSearchQuery(searchQuery);
1264:             setSearchFocusIndex(-1); // Reset highlight when query changes
1265:         }, 150);
1266:         return ()=>clearTimeout(handler);
1267:     }, [
1268:         searchQuery
1269:     ]);
1270:     (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
1271:         const handleClickOutside = (e)=>{
1272:             if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
1273:                 setSearchFocused(false);
1274:             }
1275:         };
1276:         document.addEventListener('mousedown', handleClickOutside);
1277:         return ()=>document.removeEventListener('mousedown', handleClickOutside);
1278:     }, []);
1279:     const aiPrompts = [
1280:         {
1281:             text: lang === 'ar' ? 'كيف يمكنني استرداد قيمة اشتراك SaaS؟' : 'How to request a SaaS subscription refund',
1282:             query: 'refund'
1283:         },
1284:         {
1285:             text: lang === 'ar' ? 'إعداد OAuth لموصلات API' : 'Setting up OAuth client API connectors',
1286:             query: 'oauth'
1287:         },
1288:         {
1289:             text: lang === 'ar' ? 'إعادة تعيين تفاصيل تسجيل الدخول المغلقة' : 'Resetting locked registry login',
1290:             query: 'registry login'
1291:         }
1292:     ];
1293:     const savedSearches = [
1294:         {
1295:             query: 'refund ORD-99881'
1296:         },
1297:         {
1298:             query: 'Stripe 403 Forbidden scopes'
1299:         },
1300:         {
1301:             query: 'SLA priority matrix'
1302:         }
1303:     ];
1304:     const filteredKbArticles = debouncedSearchQuery.trim() === '' ? [] : __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$shared$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["kbArticles"].filter((art)=>art.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || art.tags.some((t)=>t.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))).slice(0, 5);
1305:     const dropdownItems = [];
1306:     filteredKbArticles.forEach((art)=>{
1307:         dropdownItems.push({
1308:             type: 'kb',
1309:             id: art.id,
1310:             label: art.title,
1311:             onClick: ()=>{
1312:                 setSelectedArticleId(art.id);
1313:                 setActiveSubScreen('customer_kb_article');
1314:                 setSearchFocused(false);
1315:             }
1316:         });
1317:     });
1318:     aiPrompts.forEach((prompt, idx)=>{
1319:         dropdownItems.push({
1320:             type: 'prompt',
1321:             id: `prompt-${idx}`,
1322:             label: prompt.text,
1323:             onClick: ()=>{
1324:                 setSearchQuery(prompt.query);
1325:                 setDebouncedSearchQuery(prompt.query);
1326:             }
1327:         });
1328:     });
1329:     if (searchQuery.trim() !== '') {
1330:         dropdownItems.push({
1331:             type: 'action',
1332:             id: 'ask-farah',
1333:             label: lang === 'ar' ? `اسأل فرح AI عن "${searchQuery}"` : `Ask Farah AI about "${searchQuery}"`,
1334:             onClick: ()=>{
1335:                 handleSendChatMessage(searchQuery);
1336:                 setChatOpen(true);
1337:                 setSearchFocused(false);
1338:             }
1339:         });
1340:     }
1341:     const handleSearchKeyDown = (e)=>{
1342:         if (!searchFocused) {
1343:             if (e.key === 'ArrowDown') {
1344:                 setSearchFocused(true);
1345:             }
1346:             return;
1347:         }
1348:         if (e.key === 'ArrowDown') {
1349:             e.preventDefault();
1350:             setSearchFocusIndex((prev)=>(prev + 1) % dropdownItems.length);
1351:         } else if (e.key === 'ArrowUp') {
1352:             e.preventDefault();
1353:             setSearchFocusIndex((prev)=>(prev - 1 + dropdownItems.length) % dropdownItems.length);
1354:         } else if (e.key === 'Enter') {
1355:             e.preventDefault();
1356:             if (searchFocusIndex >= 0 && searchFocusIndex < dropdownItems.length) {
1357:                 dropdownItems[searchFocusIndex].onClick();
1358:             } else {
1359:                 setActiveSubScreen('customer_kb_article');
1360:                 setSearchFocused(false);
1361:             }
1362:         } else if (e.key === 'Escape') {
1363:             e.preventDefault();
1364:             setSearchFocused(false);
1365:         }
1366:     };
1367:     const highlightMatch = (text, query)=>{
1368:         if (!query.trim()) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
1369:             children: text
1370:         }, void 0, false, {
1371:             fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1372:             lineNumber: 273,
1373:             columnNumber: 31
1374:         }, this);
1375:         const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
1376:         const parts = text.split(regex);
1377:         return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
1378:             children: parts.map((part, i)=>regex.test(part) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mark", {
1379:                     className: "bg-amber-100 dark:bg-amber-950/85 text-amber-900 dark:text-amber-250 font-bold px-0.5 rounded",
1380:                     children: part
1381:                 }, i, false, {
1382:                     fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1383:                     lineNumber: 280,
1384:                     columnNumber: 15
1385:                 }, this) : part)
1386:         }, void 0, false, {
1387:             fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1388:             lineNumber: 277,
1389:             columnNumber: 7
1390:         }, this);
1391:     };
1392:     // Ticket Form States
1393:     const [ticketTitle, setTicketTitle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
1394:     const [ticketDesc, setTicketDesc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
1395:     const [ticketPriority, setTicketPriority] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('medium');
1396:     const [ticketCategory, setTicketCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('Billing & Payments');
1397:     const [ticketReplyText, setTicketReplyText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
1398:     // Modals & Panels Toggles
1399:     const [showSubmitModal, setShowSubmitModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
1400:     const [showCallbackModal, setShowCallbackModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
1401:     const [showVoiceModal, setShowVoiceModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
1402:     const [showCobrowseModal, setShowCobrowseModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
1403:     const [showAccessibilityWidget, setShowAccessibilityWidget] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
1404:     // Accessibility States (Scoped to Customer portal)
1405:     const [fontSize, setFontSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('base');
1406:     const [highContrast, setHighContrast] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
1407:     // Callback states
1408:     const [callbackPhone, setCallbackPhone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
1409:     const [callbackTime, setCallbackTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('As soon as possible');
1410:     // Co-Browse states
1411:     const [cobrowsePin, setCobrowsePin] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
1412:     const [cobrowseConnected, setCobrowseConnected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
1413:     // Order Lookup & Refund Flow States
1414:     const [otpStep, setOtpStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('none');
1415:     const [lookupEmail, setLookupEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
1416:     const [lookupOtp, setLookupOtp] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
1417:     const [lookupOrderNum] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('ORD-99881');
1418:     const [refundStep, setRefundStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('none');
1419:     const [refundReason, setRefundReason] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('Damaged on Arrival');
1420:     const [refundAttachment, setRefundAttachment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
1421:     const [otpError, setOtpError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
1422:     const [submitSuccessMessage, setSubmitSuccessMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
1423:     // Floating Live Chat Overlay States
1424:     const [chatOpen, setChatOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
1425:     const [chatInput, setChatInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
1426:     const [chatLanguage, setChatLanguage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('en');
1427:     const [chatMessages, setChatMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([
1428:         {
1429:             sender: 'bot',
1430:             text: 'Hi! I am Farah. How can I help you today?\n\nأهلاً! أنا فرح المساعد الذكي. كيف يمكنني مساعدتك؟',
1431:             time: '15:00'
1432:         }
1433:     ]);
1434:     const [chatStatus, setChatStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('idle');
1435:     const [queuePos, setQueuePos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(3);
1436:     const [surveyCsat, setSurveyCsat] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
1437:     const [surveyNps, setSurveyNps] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
1438:     const [transcriptEmail, setTranscriptEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
1439:     // ----------------------------------------------------
1440:     // Handlers
1441:     // ----------------------------------------------------
1442:     const handleTicketSubmit = (e)=>{
1443:         e.preventDefault();
1444:         if (!ticketTitle || !ticketDesc) return;
1445:         createTicket({
1446:             title: ticketTitle,
1447:             description: ticketDesc,
1448:             customerName: 'David Miller',
1449:             customerEmail: 'david.miller@yahoo.com',
1450:             priority: ticketPriority,
1451:             status: 'open',
1452:             category: ticketCategory
1453:         });
1454:         setTicketTitle('');
1455:         setTicketDesc('');
1456:         setShowSubmitModal(false);
1457:         addAuditLog(`David Miller submitted support ticket: ${ticketTitle}`, 'success');
1458:         setSubmitSuccessMessage(`Support Case "${ticketTitle}" submitted successfully!`);
1459:         setTimeout(()=>{
1460:             setSubmitSuccessMessage(null);
1461:         }, 4000);
1462:         setActiveSubScreen('customer_my_tickets');
1463:     };
1464:     const handlePostReply = (e)=>{
1465:         e.preventDefault();
1466:         if (!ticketReplyText || !selectedTicketId) return;
1467:         addAuditLog(`Posted reply to ticket ${selectedTicketId}: "${ticketReplyText}"`, 'success');
1468:         setTicketReplyText('');
1469:     };
1470:     const handleScheduleCallback = (e)=>{
1471:         e.preventDefault();
1472:         if (!callbackPhone) return;
1473:         addAuditLog(`Voice callback scheduled to line ${callbackPhone}`, 'success');
1474:         setCallbackQueued(true);
1475:         setShowCallbackModal(false);
1476:         pushToast('success', lang === 'ar' ? 'تم جدولة الاتصال' : 'Callback Scheduled', lang === 'ar' ? `سيتصل بك الوكيل على الرقم ${callbackPhone} في أقرب وقت ممكن.` : `An agent will call you at ${callbackPhone} soon.`);
1477:     };
1478:     const handleJoinCobrowse = (e)=>{
1479:         e.preventDefault();
1480:         if (!cobrowsePin) return;
1481:         setCobrowseConnected(true);
1482:         addAuditLog(`Co-Browse session joined. Pin: ${cobrowsePin}`, 'success');
1483:         setTimeout(()=>{
1484:             setCobrowseConnected(false);
1485:             setShowCobrowseModal(false);
1486:             setCobrowsePin('');
1487:             setSubmitSuccessMessage('Co-Browse session finished successfully.');
1488:             setTimeout(()=>{
1489:                 setSubmitSuccessMessage(null);
1490:             }, 4000);
1491:         }, 4000);
1492:     };
1493:     const handleArticleHelpful = (id, type)=>{
1494:         setArticleFeedbackGiven((prev)=>({
1495:                 ...prev,
1496:                 [id]: type
1497:             }));
1498:         addAuditLog(`Helpfulness feedback logged for KB article: ${id} (${type})`, 'success');
1499:     };
1500:     const handleOtpRequest = (e)=>{
1501:         e.preventDefault();
1502:         if (!lookupEmail) return;
1503:         setOtpError(null);
1504:         setChatStatus('typing');
1505:         setTimeout(()=>{
1506:             setOtpStep('code');
1507:             setChatStatus('idle');
1508:             addAuditLog(`OTP verification code generated and sent to: ${lookupEmail}`, 'success');
1509:         }, 1000);
1510:     };
1511:     const handleVerifyOtp = (e)=>{
1512:         e.preventDefault();
1513:         if (lookupOtp !== '1234') {
1514:             setOtpError('Incorrect code. Use 1234 for testing.');
1515:             return;
1516:         }
1517:         setOtpError(null);
1518:         setChatStatus('typing');
1519:         setTimeout(()=>{
1520:             setOtpStep('verified');
1521:             setChatStatus('idle');
1522:             addAuditLog(`OTP authorized successfully for order: ${lookupOrderNum}`, 'success');
1523:         }, 1000);
1524:     };
1525:     const handleSendChatMessage = (text)=>{
1526:         if (!text) return;
1527:         const timeStr = new Date().toLocaleTimeString([], {
1528:             hour: '2-digit',
1529:             minute: '2-digit'
1530:         });
1531:         setChatMessages((prev)=>[
1532:                 ...prev,
1533:                 {
1534:                     sender: 'user',
1535:                     text,
1536:                     time: timeStr
1537:                 }
1538:             ]);
1539:         setChatInput('');
1540:         setChatStatus('typing');
1541:         setTimeout(()=>{
1542:             let response = 'I could not find exact parameters in our RAG indexes. Would you like to consult a live support agent?';
1543:             const lower = text.toLowerCase();
1544:             if (lower.includes('refund') || lower.includes('return') || lower.includes('ارجاع')) {
1545:                 response = 'Refund Policy ks-1 allows return actions within 30 days of renewal. Type "order status" or check the refund options in the home screen.';
1546:             } else if (lower.includes('price') || lower.includes('cost') || lower.includes('سعر')) {
1547:                 response = 'SaaS Standard accounts run at $49/month and Premium channels at $99/month. Direct invoicing can be set up via CRM Connectors.';
1548:             } else if (lower.includes('delay') || lower.includes('تأخير')) {
1549:                 response = 'Fiber Gateway ORD-77612 shows a pending carrier milestone. Try scheduling a voice callback or checking order timeline logs.';
1550:             } else if (lower.includes('agent') || lower.includes('human') || lower.includes('انسان')) {
1551:                 setChatStatus('queue');
1552:                 setQueuePos(3);
1553:                 return;
1554:             }
1555:             setChatMessages((prev)=>[
1556:                     ...prev,
1557:                     {
1558:                         sender: 'bot',
1559:                         text: response,
1560:                         time: timeStr
1561:                     }
1562:                 ]);
1563:             setChatStatus('idle');
1564:         }, 1200);
1565:     };
1566:     (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
1567:         if (chatStatus !== 'queue') return;
1568:         const interval = setInterval(()=>{
1569:             setQueuePos((prev)=>{
1570:                 if (prev <= 1) {
1571:                     clearInterval(interval);
1572:                     setChatStatus('human_chat');
1573:                     setChatMessages((m)=>[
1574:                             ...m,
1575:                             {
1576:                                 sender: 'system',
1577:                                 text: 'Queue connected. Agent Nadia Vance joined the conversation.',
1578:                                 time: ''
1579:                             },
1580:                             {
1581:                                 sender: 'agent',
1582:                                 text: 'Hi David! I am Nadia Vance. I see you requested human support. Let me look at your account logs.',
1583:                                 time: '15:04'
1584:                             }
1585:                         ]);
1586:                     return 0;
1587:                 }
1588:                 return prev - 1;
1589:             });
1590:         }, 3000);
1591:         return ()=>clearInterval(interval);
1592:     }, [
1593:         chatStatus
1594:     ]);
1595:     (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
1596:         if (highContrast) {
1597:             document.body.classList.add('high-contrast-mode', 'accessibility-high-contrast');
1598:         } else {
1599:             document.body.classList.remove('high-contrast-mode', 'accessibility-high-contrast');
1600:         }
1601:         return ()=>{
1602:             document.body.classList.remove('high-contrast-mode', 'accessibility-high-contrast');
1603:         };
1604:     }, [
1605:         highContrast
1606:     ]);
1607:     (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
1608:         document.body.classList.remove('portal-scale-sm', 'portal-scale-lg', 'accessibility-font-sm', 'accessibility-font-lg');
1609:         if (fontSize === 'sm') {
1610:             document.body.classList.add('portal-scale-sm', 'accessibility-font-sm');
1611:         } else if (fontSize === 'lg') {
1612:             document.body.classList.add('portal-scale-lg', 'accessibility-font-lg');
1613:         }
1614:         return ()=>{
1615:             document.body.classList.remove('portal-scale-sm', 'portal-scale-lg', 'accessibility-font-sm', 'accessibility-font-lg');
1616:         };
1617:     }, [
1618:         fontSize
1619:     ]);
1620:     const fontClass = fontSize === 'sm' ? 'text-[11px]' : fontSize === 'lg' ? 'text-[14px]' : 'text-[12px]';
1621:     // Governance routes list
1622:     const governanceRoutes = [
1623:         {
1624:             id: 'customer_org_switcher',
1625:             labelEN: 'Workspace Settings',
1626:             labelAR: 'إعدادات بيئة العمل'
1627:         },
1628:         {
1629:             id: 'customer_audit_logs',
1630:             labelEN: 'Compliance Audit Logs',
1631:             labelAR: 'سجلات تدقيق الامتثال'
1632:         },
1633:         {
1634:             id: 'customer_exports',
1635:             labelEN: 'Compliance Exports',
1636:             labelAR: 'تصدير بيانات الامتثال'
1637:         },
1638:         {
1639:             id: 'customer_sso_status',
1640:             labelEN: 'SSO & Federation Status',
1641:             labelAR: 'حالة الربط والـ SSO'
1642:         },
1643:         {
1644:             id: 'customer_quotas',
1645:             labelEN: 'Rate Limits & Quotas',
1646:             labelAR: 'حدود الاستخدام والحصص'
1647:         }
1648:     ];
1649:     return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
1650:         className: `max-w-6xl mx-auto space-y-6 ${highContrast ? 'high-contrast-mode p-4 border-4 rounded-3xl' : 'text-slate-800 dark:text-slate-200'} ${fontSize === 'sm' ? 'portal-scale-sm' : fontSize === 'lg' ? 'portal-scale-lg' : 'portal-scale-base'} transition-all`,
1651:         dir: lang === 'ar' ? 'rtl' : 'ltr',
1652:         children: [
1653:             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
1654:                 className: "flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm",
1655:                 children: [
1656:                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
1657:                         className: "flex items-center gap-3",
1658:                         children: [
1659:                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
1660:                                 className: "w-9 h-9 bg-blue-600/10 text-blue-600 rounded-lg flex items-center justify-center",
1661:                                 children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
1662:                                     className: "w-5 h-5"
1663:                                 }, void 0, false, {
1664:                                     fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1665:                                     lineNumber: 529,
1666:                                     columnNumber: 13
1667:                                 }, this)
1668:                             }, void 0, false, {
1669:                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1670:                                 lineNumber: 528,
1671:                                 columnNumber: 11
1672:                             }, this),
1673:                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
1674:                                 children: [
1675:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
1676:                                         className: "font-bold text-sm",
1677:                                         children: t.portal.homeHero.welcomeBack
1678:                                     }, void 0, false, {
1679:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1680:                                         lineNumber: 532,
1681:                                         columnNumber: 13
1682:                                     }, this),
1683:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
1684:                                         className: "text-[10px] text-slate-400 font-semibold block font-mono",
1685:                                         children: t.portal.homeHero.profileBadge
1686:                                     }, void 0, false, {
1687:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1688:                                         lineNumber: 533,
1689:                                         columnNumber: 13
1690:                                     }, this)
1691:                                 ]
1692:                             }, void 0, true, {
1693:                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1694:                                 lineNumber: 531,
1695:                                 columnNumber: 11
1696:                             }, this)
1697:                         ]
1698:                     }, void 0, true, {
1699:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1700:                         lineNumber: 527,
1701:                         columnNumber: 9
1702:                     }, this),
1703:                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
1704:                         className: "flex items-center gap-3",
1705:                         children: [
1706:                             canAccessGovernance && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
1707:                                 children: [
1708:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
1709:                                         className: "border-l border-slate-200 dark:border-slate-800 h-6 mx-2"
1710:                                     }, void 0, false, {
1711:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1712:                                         lineNumber: 542,
1713:                                         columnNumber: 15
1714:                                     }, this),
1715:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$enterprise$2f$OrgSwitcher$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OrgSwitcher"], {}, void 0, false, {
1716:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1717:                                         lineNumber: 543,
1718:                                         columnNumber: 15
1719:                                     }, this)
1720:                                 ]
1721:                             }, void 0, true),
1722:                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
1723:                                 className: "flex gap-2",
1724:                                 children: [
1725:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
1726:                                         type: "button",
1727:                                         onClick: ()=>setGlobalSearchOpen(true),
1728:                                         className: "px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold rounded-xl transition-all font-mono flex items-center gap-1.5",
1729:                                         "aria-label": "Open global search",
1730:                                         children: [
1731:                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
1732:                                                 className: "w-3.5 h-3.5"
1733:                                             }, void 0, false, {
1734:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1735:                                                 lineNumber: 554,
1736:                                                 columnNumber: 15
1737:                                             }, this),
1738:                                             lang === 'ar' ? 'البحث' : 'Search'
1739:                                         ]
1740:                                     }, void 0, true, {
1741:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1742:                                         lineNumber: 548,
1743:                                         columnNumber: 13
1744:                                     }, this),
1745:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
1746:                                         type: "button",
1747:                                         onClick: ()=>setActiveSubScreen('customer_chat_history'),
1748:                                         className: "px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold rounded-xl transition-all font-mono",
1749:                                         children: t.portal.homeHero.pastChats
1750:                                     }, void 0, false, {
1751:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1752:                                         lineNumber: 558,
1753:                                         columnNumber: 13
1754:                                     }, this),
1755:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
1756:                                         onClick: ()=>setShowCobrowseModal(true),
1757:                                         className: "px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold rounded-xl transition-all font-mono",
1758:                                         children: t.portal.homeHero.coBrowse
1759:                                     }, void 0, false, {
1760:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1761:                                         lineNumber: 566,
1762:                                         columnNumber: 13
1763:                                     }, this),
1764:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
1765:                                         onClick: ()=>setActiveSubScreen('customer_feedback_hub'),
1766:                                         className: "px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 text-[10px] font-bold rounded-xl transition-all font-mono",
1767:                                         children: lang === 'ar' ? 'مركز التقييمات' : 'Feedback Hub'
1768:                                     }, void 0, false, {
1769:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1770:                                         lineNumber: 573,
1771:                                         columnNumber: 13
1772:                                     }, this),
1773:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
1774:                                         onClick: ()=>setShowAccessibilityWidget(true),
1775:                                         "data-testid": "accessibility-options-btn",
1776:                                         className: "px-3.5 py-1.5 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 text-[10px] font-bold rounded-xl hover:bg-blue-100 font-mono",
1777:                                         children: t.portal.homeHero.accessibilityOptions
1778:                                     }, void 0, false, {
1779:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1780:                                         lineNumber: 580,
1781:                                         columnNumber: 13
1782:                                     }, this),
1783:                                     canAccessGovernance && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
1784:                                         className: "relative",
1785:                                         ref: governanceMenuRef,
1786:                                         children: [
1787:                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
1788:                                                 onClick: ()=>setIsGovernanceMenuOpen((v)=>!v),
1789:                                                 className: `px-3.5 py-1.5 text-[10px] font-bold rounded-xl transition-all font-mono flex items-center gap-1.5 ${isGovernanceMenuOpen ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'}`,
1790:                                                 "aria-haspopup": "true",
1791:                                                 "aria-expanded": isGovernanceMenuOpen,
1792:                                                 children: [
1793:                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"], {
1794:                                                         className: "w-3.5 h-3.5"
1795:                                                     }, void 0, false, {
1796:                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1797:                                                         lineNumber: 601,
1798:                                                         columnNumber: 19
1799:                                                     }, this),
1800:                                                     lang === 'ar' ? 'الحوكمة' : 'Governance',
1801:                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
1802:                                                         className: `w-3.5 h-3.5 transition-transform duration-100 ${isGovernanceMenuOpen ? 'rotate-180' : ''}`
1803:                                                     }, void 0, false, {
1804:                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1805:                                                         lineNumber: 603,
1806:                                                         columnNumber: 19
1807:                                                     }, this)
1808:                                                 ]
1809:                                             }, void 0, true, {
1810:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1811:                                                 lineNumber: 591,
1812:                                                 columnNumber: 17
1813:                                             }, this),
1814:                                             isGovernanceMenuOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
1815:                                                 className: `absolute top-10 ${lang === 'ar' ? 'left-0' : 'right-0'} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl shadow-2xl z-50 w-56 text-xs font-semibold animate-in zoom-in-95 duration-100 origin-top`,
1816:                                                 role: "menu",
1817:                                                 children: [
1818:                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
1819:                                                         className: "block text-[8.5px] uppercase font-bold text-slate-400 font-mono mb-2 px-2",
1820:                                                         children: lang === 'ar' ? 'إدارة المؤسسة والامتثال' : 'Enterprise & Compliance'
1821:                                                     }, void 0, false, {
1822:                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1823:                                                         lineNumber: 611,
1824:                                                         columnNumber: 21
1825:                                                     }, this),
1826:                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
1827:                                                         className: "space-y-1",
1828:                                                         children: governanceRoutes.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
1829:                                                                 onClick: ()=>{
1830:                                                                     setActiveSubScreen(item.id);
1831:                                                                     setIsGovernanceMenuOpen(false);
1832:                                                                 },
1833:                                                                 className: "w-full flex items-center text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer text-slate-700 dark:text-slate-350",
1834:                                                                 style: {
1835:                                                                     textAlign: lang === 'ar' ? 'right' : 'left'
1836:                                                                 },
1837:                                                                 role: "menuitem",
1838:                                                                 children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
1839:                                                                     className: "text-[10.5px] font-bold",
1840:                                                                     children: lang === 'ar' ? item.labelAR : item.labelEN
1841:                                                                 }, void 0, false, {
1842:                                                                     fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1843:                                                                     lineNumber: 626,
1844:                                                                     columnNumber: 27
1845:                                                                 }, this)
1846:                                                             }, item.id, false, {
1847:                                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1848:                                                                 lineNumber: 616,
1849:                                                                 columnNumber: 25
1850:                                                             }, this))
1851:                                                     }, void 0, false, {
1852:                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1853:                                                         lineNumber: 614,
1854:                                                         columnNumber: 21
1855:                                                     }, this)
1856:                                                 ]
1857:                                             }, void 0, true, {
1858:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1859:                                                 lineNumber: 607,
1860:                                                 columnNumber: 19
1861:                                             }, this)
1862:                                         ]
1863:                                     }, void 0, true, {
1864:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1865:                                         lineNumber: 590,
1866:                                         columnNumber: 15
1867:                                     }, this)
1868:                                 ]
1869:                             }, void 0, true, {
1870:                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1871:                                 lineNumber: 547,
1872:                                 columnNumber: 11
1873:                             }, this)
1874:                         ]
1875:                     }, void 0, true, {
1876:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1877:                         lineNumber: 538,
1878:                         columnNumber: 9
1879:                     }, this)
1880:                 ]
1881:             }, void 0, true, {
1882:                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1883:                 lineNumber: 526,
1884:                 columnNumber: 7
1885:             }, this),
1886:             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
1887:                 className: fontClass,
1888:                 children: [
1889:                     activeSubScreen === 'customer_home' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
1890:                         className: "space-y-2.5 animate-in fade-in duration-250",
1891:                         children: [
1892:                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
1893:                                 className: "bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 p-2 rounded-xl flex items-center gap-3 text-[10.5px] font-semibold",
1894:                                 children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
1895:                                     className: "flex-1",
1896:                                     children: lang === 'ar' ? 'تنبيه الصيانة: ستخضع أنظمة التخزين السحابي لصيانة مجدولة في 12 يونيو بين الساعة 02:00 و 04:00 بتوقيت مكة.' : 'Maintenance Alert: Cloud storage systems scheduled for routine optimization on June 12, 02:00 - 04:00 UTC.'
1897:                                 }, void 0, false, {
1898:                                     fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1899:                                     lineNumber: 644,
1900:                                     columnNumber: 15
1901:                                 }, this)
1902:                             }, void 0, false, {
1903:                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1904:                                 lineNumber: 643,
1905:                                 columnNumber: 13
1906:                             }, this),
1907:                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
1908:                                 className: "bg-gradient-to-r from-blue-600 to-indigo-750 text-white rounded-3xl py-3.5 px-5 text-center space-y-1.5 shadow-md shadow-blue-500/5 relative overflow-visible",
1909:                                 children: [
1910:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
1911:                                         className: "inline-block px-2 py-0.5 bg-white/15 rounded-full text-[8.5px] font-bold backdrop-blur-md font-mono",
1912:                                         children: t.portal.homeHero.badge
1913:                                     }, void 0, false, {
1914:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1915:                                         lineNumber: 653,
1916:                                         columnNumber: 15
1917:                                     }, this),
1918:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
1919:                                         className: "text-xl font-extrabold tracking-tight leading-none",
1920:                                         children: t.portal.homeHero.heroTitle
1921:                                     }, void 0, false, {
1922:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1923:                                         lineNumber: 656,
1924:                                         columnNumber: 15
1925:                                     }, this),
1926:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
1927:                                         className: "text-[10.5px] text-blue-100 max-w-md mx-auto leading-normal",
1928:                                         children: t.portal.homeHero.heroDesc
1929:                                     }, void 0, false, {
1930:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1931:                                         lineNumber: 657,
1932:                                         columnNumber: 15
1933:                                     }, this),
1934:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
1935:                                         className: "max-w-[340px] mx-auto relative pt-0.5",
1936:                                         ref: searchContainerRef,
1937:                                         children: [
1938:                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
1939:                                                 className: "absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400"
1940:                                             }, void 0, false, {
1941:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1942:                                                 lineNumber: 662,
1943:                                                 columnNumber: 17
1944:                                             }, this),
1945:                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
1946:                                                 type: "text",
1947:                                                 "data-testid": "portal-search-input",
1948:                                                 placeholder: t.portal.homeHero.searchPlaceholder,
1949:                                                 value: searchQuery,
1950:                                                 onFocus: ()=>setSearchFocused(true),
1951:                                                 onChange: (e)=>{
1952:                                                     setSearchQuery(e.target.value);
1953:                                                     setSearchFocused(true);
1954:                                                 },
1955:                                                 onKeyDown: handleSearchKeyDown,
1956:                                                 className: "w-full pl-8.5 pr-4 py-1.5 rounded-xl bg-white text-slate-850 text-[11px] focus:outline-none shadow-sm hover:shadow-md focus:shadow-lg border border-slate-200 dark:border-slate-800/40 focus:ring-2 focus:ring-blue-400/80 font-semibold transition-all"
1957:                                             }, void 0, false, {
1958:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1959:                                                 lineNumber: 663,
1960:                                                 columnNumber: 17
1961:                                             }, this),
1962:                                             searchFocused && (dropdownItems.length > 0 || savedSearches.length > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
1963:                                                 className: "absolute left-0 right-0 mt-0.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 text-left space-y-2 animate-in fade-in slide-in-from-top-1.5 duration-100",
1964:                                                 children: [
1965:                                                     savedSearches.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
1966:                                                         className: "space-y-0.5",
1967:                                                         children: [
1968:                                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
1969:                                                                 className: "block text-[7.5px] uppercase font-bold text-slate-400 font-mono tracking-wider px-1",
1970:                                                                 children: lang === 'ar' ? 'عمليات البحث المحفوظة' : 'Saved Searches'
1971:                                                             }, void 0, false, {
1972:                                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1973:                                                                 lineNumber: 684,
1974:                                                                 columnNumber: 25
1975:                                                             }, this),
1976:                                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
1977:                                                                 className: "flex flex-wrap gap-1 px-1",
1978:                                                                 children: savedSearches.map((search, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
1979:                                                                         onClick: ()=>{
1980:                                                                             setSearchQuery(search.query);
1981:                                                                             setDebouncedSearchQuery(search.query);
1982:                                                                         },
1983:                                                                         className: "px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[9px] font-semibold text-slate-700 dark:text-slate-300 rounded-md cursor-pointer transition-colors",
1984:                                                                         children: search.query
1985:                                                                     }, idx, false, {
1986:                                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1987:                                                                         lineNumber: 689,
1988:                                                                         columnNumber: 29
1989:                                                                     }, this))
1990:                                                             }, void 0, false, {
1991:                                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1992:                                                                 lineNumber: 687,
1993:                                                                 columnNumber: 25
1994:                                                             }, this)
1995:                                                         ]
1996:                                                     }, void 0, true, {
1997:                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
1998:                                                         lineNumber: 683,
1999:                                                         columnNumber: 23
2000:                                                     }, this),
2001:                                                     filteredKbArticles.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2002:                                                         className: "space-y-0.5",
2003:                                                         children: [
2004:                                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
2005:                                                                 className: "block text-[7.5px] uppercase font-bold text-slate-400 font-mono tracking-wider px-1 mb-0.5",
2006:                                                                 children: lang === 'ar' ? 'مقالات المعرفة المطابقة' : 'Instant Knowledge Matches'
2007:                                                             }, void 0, false, {
2008:                                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2009:                                                                 lineNumber: 707,
2010:                                                                 columnNumber: 25
2011:                                                             }, this),
2012:                                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2013:                                                                 className: "space-y-0.5",
2014:                                                                 children: filteredKbArticles.map((art)=>{
2015:                                                                     const itemIndex = dropdownItems.findIndex((item)=>item.type === 'kb' && item.id === art.id);
2016:                                                                     const isHighlighted = itemIndex === searchFocusIndex;
2017:                                                                     return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
2018:                                                                         onClick: ()=>{
2019:                                                                             setSelectedArticleId(art.id);
2020:                                                                             setActiveSubScreen('customer_kb_article');
2021:                                                                             setSearchFocused(false);
2022:                                                                         },
2023:                                                                         className: `w-full flex items-center gap-2 px-1.5 py-0.5 rounded-lg text-left cursor-pointer transition-colors ${isHighlighted ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'hover:bg-blue-500/5 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300'}`,
2024:                                                                         children: [
2025:                                                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
2026:                                                                                 className: "w-3 h-3 text-slate-400 shrink-0"
2027:                                                                             }, void 0, false, {
2028:                                                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2029:                                                                                 lineNumber: 728,
2030:                                                                                 columnNumber: 33
2031:                                                                             }, this),
2032:                                                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
2033:                                                                                 className: "text-[10px] font-semibold truncate",
2034:                                                                                 children: highlightMatch(art.title, searchQuery)
2035:                                                                             }, void 0, false, {
2036:                                                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2037:                                                                                 lineNumber: 729,
2038:                                                                                 columnNumber: 33
2039:                                                                             }, this)
2040:                                                                         ]
2041:                                                                     }, art.id, true, {
2042:                                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2043:                                                                         lineNumber: 715,
2044:                                                                         columnNumber: 31
2045:                                                                     }, this);
2046:                                                                 })
2047:                                                             }, void 0, false, {
2048:                                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2049:                                                                 lineNumber: 710,
2050:                                                                 columnNumber: 25
2051:                                                             }, this)
2052:                                                         ]
2053:                                                     }, void 0, true, {
2054:                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2055:                                                         lineNumber: 706,
2056:                                                         columnNumber: 23
2057:                                                     }, this),
2058:                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2059:                                                         className: "space-y-0.5",
2060:                                                         children: [
2061:                                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
2062:                                                                 className: "block text-[7.5px] uppercase font-bold text-slate-400 font-mono tracking-wider px-1 mb-0.5",
2063:                                                                 children: lang === 'ar' ? 'اقتراحات فرح الذكية' : 'AI Assistant Suggestions'
2064:                                                             }, void 0, false, {
2065:                                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2066:                                                                 lineNumber: 741,
2067:                                                                 columnNumber: 23
2068:                                                             }, this),
2069:                                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2070:                                                                 className: "space-y-0.5",
2071:                                                                 children: aiPrompts.map((prompt, idx)=>{
2072:                                                                     const itemIndex = dropdownItems.findIndex((item)=>item.type === 'prompt' && item.id === `prompt-${idx}`);
2073:                                                                     const isHighlighted = itemIndex === searchFocusIndex;
2074:                                                                     return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
2075:                                                                         onClick: ()=>{
2076:                                                                             setSearchQuery(prompt.query);
2077:                                                                             setDebouncedSearchQuery(prompt.query);
2078:                                                                         },
2079:                                                                         className: `w-full flex items-center gap-2 px-1.5 py-0.75 rounded-lg text-left cursor-pointer transition-colors ${isHighlighted ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'hover:bg-blue-500/5 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300'}`,
2080:                                                                         children: [
2081:                                                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
2082:                                                                                 className: "w-3 h-3 text-amber-500 shrink-0"
2083:                                                                             }, void 0, false, {
2084:                                                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2085:                                                                                 lineNumber: 761,
2086:                                                                                 columnNumber: 31
2087:                                                                             }, this),
2088:                                                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
2089:                                                                                 className: "text-[10px] font-medium truncate",
2090:                                                                                 children: prompt.text
2091:                                                                             }, void 0, false, {
2092:                                                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2093:                                                                                 lineNumber: 762,
2094:                                                                                 columnNumber: 31
2095:                                                                             }, this)
2096:                                                                         ]
2097:                                                                     }, idx, true, {
2098:                                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2099:                                                                         lineNumber: 749,
2100:                                                                         columnNumber: 29
2101:                                                                     }, this);
2102:                                                                 })
2103:                                                             }, void 0, false, {
2104:                                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2105:                                                                 lineNumber: 744,
2106:                                                                 columnNumber: 23
2107:                                                             }, this)
2108:                                                         ]
2109:                                                     }, void 0, true, {
2110:                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2111:                                                         lineNumber: 740,
2112:                                                         columnNumber: 21
2113:                                                     }, this),
2114:                                                     searchQuery.trim() !== '' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2115:                                                         className: "pt-1 border-t border-slate-100 dark:border-slate-800/60",
2116:                                                         children: (()=>{
2117:                                                             const itemIndex = dropdownItems.findIndex((item)=>item.type === 'action' && item.id === 'ask-farah');
2118:                                                             const isHighlighted = itemIndex === searchFocusIndex;
2119:                                                             return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
2120:                                                                 onClick: ()=>{
2121:                                                                     handleSendChatMessage(searchQuery);
2122:                                                                     setChatOpen(true);
2123:                                                                     setSearchFocused(false);
2124:                                                                 },
2125:                                                                 className: `w-full flex items-center justify-between px-1.5 py-0.75 rounded-lg text-left cursor-pointer transition-colors ${isHighlighted ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' : 'bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400'}`,
2126:                                                                 children: [
2127:                                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2128:                                                                         className: "flex items-center gap-2 truncate",
2129:                                                                         children: [
2130:                                                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__["Bot"], {
2131:                                                                                 className: "w-3 h-3 shrink-0 text-blue-500"
2132:                                                                             }, void 0, false, {
2133:                                                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2134:                                                                                 lineNumber: 789,
2135:                                                                                 columnNumber: 33
2136:                                                                             }, this),
2137:                                                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
2138:                                                                                 className: "text-[10px] font-bold truncate",
2139:                                                                                 children: lang === 'ar' ? `اسأل فرح الذكية عن "${searchQuery}"` : `Ask Farah AI about "${searchQuery}"`
2140:                                                                             }, void 0, false, {
2141:                                                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2142:                                                                                 lineNumber: 790,
2143:                                                                                 columnNumber: 33
2144:                                                                             }, this)
2145:                                                                         ]
2146:                                                                     }, void 0, true, {
2147:                                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2148:                                                                         lineNumber: 788,
2149:                                                                         columnNumber: 31
2150:                                                                     }, this),
2151:                                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
2152:                                                                         className: "text-[8px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded shrink-0",
2153:                                                                         children: lang === 'ar' ? 'تشغيل' : 'Ask'
2154:                                                                     }, void 0, false, {
2155:                                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2156:                                                                         lineNumber: 794,
2157:                                                                         columnNumber: 31
2158:                                                                     }, this)
2159:                                                                 ]
2160:                                                             }, void 0, true, {
2161:                                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2162:                                                                 lineNumber: 776,
2163:                                                                 columnNumber: 29
2164:                                                             }, this);
2165:                                                         })()
2166:                                                     }, void 0, false, {
2167:                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2168:                                                         lineNumber: 771,
2169:                                                         columnNumber: 23
2170:                                                     }, this),
2171:                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2172:                                                         className: "pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[8px] text-slate-400 dark:text-slate-500 font-mono font-bold text-center",
2173:                                                         children: [
2174:                                                             "↑↓ ",
2175:                                                             lang === 'ar' ? 'للتنقل' : 'navigate',
2176:                                                             "  •  Enter ",
2177:                                                             lang === 'ar' ? 'للاختيار' : 'select',
2178:                                                             "  •  Esc ",
2179:                                                             lang === 'ar' ? 'للإغلاق' : 'close'
2180:                                                         ]
2181:                                                     }, void 0, true, {
2182:                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2183:                                                         lineNumber: 804,
2184:                                                         columnNumber: 21
2185:                                                     }, this)
2186:                                                 ]
2187:                                             }, void 0, true, {
2188:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2189:                                                 lineNumber: 679,
2190:                                                 columnNumber: 19
2191:                                             }, this)
2192:                                         ]
2193:                                     }, void 0, true, {
2194:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2195:                                         lineNumber: 661,
2196:                                         columnNumber: 15
2197:                                     }, this),
2198:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2199:                                         className: "flex flex-wrap justify-center gap-1.5 pt-1.5 text-[9px]",
2200:                                         children: [
2201:                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
2202:                                                 className: "text-blue-200 font-semibold mt-0.5",
2203:                                                 children: lang === 'ar' ? 'اقتراحات سريعة:' : 'Quick Prompts:'
2204:                                             }, void 0, false, {
2205:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2206:                                                 lineNumber: 814,
2207:                                                 columnNumber: 17
2208:                                             }, this),
2209:                                             [
2210:                                                 {
2211:                                                     label: lang === 'ar' ? 'استرجاع اشتراك' : 'Refund subscription',
2212:                                                     query: 'refund'
2213:                                                 },
2214:                                                 {
2215:                                                     label: lang === 'ar' ? 'إعداد OAuth' : 'Setup OAuth client',
2216:                                                     query: 'oauth'
2217:                                                 },
2218:                                                 {
2219:                                                     label: lang === 'ar' ? 'حساب مغلق' : 'Locked account login',
2220:                                                     query: 'login'
2221:                                                 }
2222:                                             ].map((chip, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
2223:                                                     onClick: ()=>{
2224:                                                         setSearchQuery(chip.query);
2225:                                                         setDebouncedSearchQuery(chip.query);
2226:                                                         setActiveSubScreen('customer_kb_article');
2227:                                                     },
2228:                                                     className: "px-2 py-0.5 bg-white/15 hover:bg-white/25 rounded-full text-white font-medium cursor-pointer transition-colors",
2229:                                                     children: chip.label
2230:                                                 }, idx, false, {
2231:                                                     fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2232:                                                     lineNumber: 822,
2233:                                                     columnNumber: 19
2234:                                                 }, this))
2235:                                         ]
2236:                                     }, void 0, true, {
2237:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2238:                                         lineNumber: 813,
2239:                                         columnNumber: 15
2240:                                     }, this)
2241:                                 ]
2242:                             }, void 0, true, {
2243:                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2244:                                 lineNumber: 652,
2245:                                 columnNumber: 13
2246:                             }, this),
2247:                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2248:                                 className: "grid grid-cols-2 md:grid-cols-4 gap-1.5",
2249:                                 children: [
2250:                                     {
2251:                                         id: 'ticket',
2252:                                         title: lang === 'ar' ? 'تقديم تذكرة دعم' : 'Submit Ticket',
2253:                                         desc: lang === 'ar' ? 'إنشاء بلاغ دعم فني' : 'File a support case',
2254:                                         icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
2255:                                             className: "w-4 h-4 text-purple-500"
2256:                                         }, void 0, false, {
2257:                                             fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2258:                                             lineNumber: 844,
2259:                                             columnNumber: 25
2260:                                         }, this),
2261:                                         onClick: ()=>setShowSubmitModal(true)
2262:                                     },
2263:                                     {
2264:                                         id: 'chat',
2265:                                         title: lang === 'ar' ? 'المحادثة الفورية' : 'Live Chat',
2266:                                         desc: lang === 'ar' ? 'تواصل مع الدعم الذكي' : 'Consult Farah AI',
2267:                                         icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"], {
2268:                                             className: "w-4 h-4 text-blue-500"
2269:                                         }, void 0, false, {
2270:                                             fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2271:                                             lineNumber: 851,
2272:                                             columnNumber: 25
2273:                                         }, this),
2274:                                         onClick: ()=>setChatOpen(true)
2275:                                     },
2276:                                     {
2277:                                         id: 'callback',
2278:                                         title: lang === 'ar' ? 'طلب مكالمة هاتفية' : 'Voice Callback',
2279:                                         desc: lang === 'ar' ? 'جدولة اتصال الدعم الفني' : 'Schedule callback',
2280:                                         icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2d$call$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__PhoneCall$3e$__["PhoneCall"], {
2281:                                             className: "w-4 h-4 text-indigo-500"
2282:                                         }, void 0, false, {
2283:                                             fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2284:                                             lineNumber: 858,
2285:                                             columnNumber: 25
2286:                                         }, this),
2287:                                         onClick: ()=>setShowCallbackModal(true)
2288:                                     },
2289:                                     {
2290:                                         id: 'cobrowse',
2291:                                         title: lang === 'ar' ? 'تصفح مشترك' : 'Co-Browse',
2292:                                         desc: lang === 'ar' ? 'مشاركة شاشة آمنة' : 'Secure screen share',
2293:                                         icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
2294:                                             className: "w-4 h-4 text-emerald-500"
2295:                                         }, void 0, false, {
2296:                                             fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2297:                                             lineNumber: 865,
2298:                                             columnNumber: 25
2299:                                         }, this),
2300:                                         onClick: ()=>setShowCobrowseModal(true)
2301:                                     },
2302:                                     {
2303:                                         id: 'kb_hub',
2304:                                         title: lang === 'ar' ? 'مركز المعرفة' : 'Knowledge Hub',
2305:                                         desc: lang === 'ar' ? 'تصفح مقالات الدعم والمساعدة' : 'Browse setup guides',
2306:                                         icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
2307:                                             className: "w-4 h-4 text-amber-500"
2308:                                         }, void 0, false, {
2309:                                             fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2310:                                             lineNumber: 872,
2311:                                             columnNumber: 25
2312:                                         }, this),
2313:                                         onClick: ()=>{
2314:                                             setKbCategoryFilter('All');
2315:                                             setSelectedArticleId('');
2316:                                             setActiveSubScreen('customer_kb_article');
2317:                                         }
2318:                                     },
2319:                                     {
2320:                                         id: 'track',
2321:                                         title: lang === 'ar' ? 'متابعة التذاكر' : 'Track Tickets',
2322:                                         desc: lang === 'ar' ? 'حالة البلاغات النشطة' : 'View active cases',
2323:                                         icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$list$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardList$3e$__["ClipboardList"], {
2324:                                             className: "w-4 h-4 text-pink-500"
2325:                                         }, void 0, false, {
2326:                                             fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2327:                                             lineNumber: 883,
2328:                                             columnNumber: 25
2329:                                         }, this),
2330:                                         onClick: ()=>setActiveSubScreen('customer_my_tickets')
2331:                                     },
2332:                                     {
2333:                                         id: 'copilot',
2334:                                         title: lang === 'ar' ? 'مساعد فرح الذكي' : 'AI Copilot',
2335:                                         desc: lang === 'ar' ? 'مساحة العمل الذكية' : 'AI workspace engine',
2336:                                         icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__["Bot"], {
2337:                                             className: "w-4 h-4 text-teal-500"
2338:                                         }, void 0, false, {
2339:                                             fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2340:                                             lineNumber: 890,
2341:                                             columnNumber: 25
2342:                                         }, this),
2343:                                         onClick: ()=>setActiveSubScreen('customer_kb')
2344:                                     },
2345:                                     {
2346:                                         id: 'status',
2347:                                         title: lang === 'ar' ? 'حالة النظام' : 'System Status',
2348:                                         desc: lang === 'ar' ? 'استقرار وجودة الخدمات' : 'Monitor platform systems',
2349:                                         icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
2350:                                             className: "w-4 h-4 text-rose-500"
2351:                                         }, void 0, false, {
2352:                                             fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2353:                                             lineNumber: 897,
2354:                                             columnNumber: 25
2355:                                         }, this),
2356:                                         onClick: ()=>setActiveSubScreen('customer_system_status')
2357:                                     }
2358:                                 ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
2359:                                         onClick: item.onClick,
2360:                                         className: `group flex items-center gap-2 p-1.5 rounded-xl text-left transition-all active:scale-[0.98] min-h-[50px] ${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$design$2d$system$2f$tokens$2f$surfaces$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SURFACE_PANEL"]} ${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$design$2d$system$2f$tokens$2f$interactions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INTERACTIVE_CARD"]} ${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$design$2d$system$2f$tokens$2f$interactions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SUPPORT_MICRO_TRANSITION"]}`,
2361:                                         style: {
2362:                                             textAlign: lang === 'ar' ? 'right' : 'left'
2363:                                         },
2364:                                         children: [
2365:                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2366:                                                 className: "p-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-lg group-hover:scale-105 transition-transform shrink-0",
2367:                                                 children: item.icon
2368:                                             }, void 0, false, {
2369:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2370:                                                 lineNumber: 907,
2371:                                                 columnNumber: 19
2372:                                             }, this),
2373:                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2374:                                                 className: "space-y-0.5 min-w-0",
2375:                                                 children: [
2376:                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
2377:                                                         className: "font-extrabold text-[10.5px] text-slate-805 dark:text-white leading-tight truncate",
2378:                                                         children: item.title
2379:                                                     }, void 0, false, {
2380:                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2381:                                                         lineNumber: 911,
2382:                                                         columnNumber: 21
2383:                                                     }, this),
2384:                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
2385:                                                         className: "text-[8.5px] text-slate-400 dark:text-slate-455 leading-none truncate",
2386:                                                         children: item.desc
2387:                                                     }, void 0, false, {
2388:                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2389:                                                         lineNumber: 914,
2390:                                                         columnNumber: 21
2391:                                                     }, this)
2392:                                                 ]
2393:                                             }, void 0, true, {
2394:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2395:                                                 lineNumber: 910,
2396:                                                 columnNumber: 19
2397:                                             }, this)
2398:                                         ]
2399:                                     }, item.id, true, {
2400:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2401:                                         lineNumber: 901,
2402:                                         columnNumber: 17
2403:                                     }, this))
2404:                             }, void 0, false, {
2405:                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2406:                                 lineNumber: 838,
2407:                                 columnNumber: 13
2408:                             }, this),
2409:                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2410:                                 className: "space-y-1.5",
2411:                                 children: [
2412:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2413:                                         className: "flex items-center gap-1.5 px-0.5",
2414:                                         children: [
2415:                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
2416:                                                 className: "w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse"
2417:                                             }, void 0, false, {
2418:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2419:                                                 lineNumber: 925,
2420:                                                 columnNumber: 17
2421:                                             }, this),
2422:                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
2423:                                                 className: "text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider",
2424:                                                 children: lang === 'ar' ? 'توصيات فرح المخصصة لك' : 'AI Recommended Support Intel'
2425:                                             }, void 0, false, {
2426:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2427:                                                 lineNumber: 926,
2428:                                                 columnNumber: 17
2429:                                             }, this)
2430:                                         ]
2431:                                     }, void 0, true, {
2432:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2433:                                         lineNumber: 924,
2434:                                         columnNumber: 15
2435:                                     }, this),
2436:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2437:                                         className: "flex sm:grid sm:grid-cols-2 overflow-x-auto sm:overflow-x-visible gap-1.5 pb-1 sm:pb-0 scrollbar-none snap-x snap-mandatory",
2438:                                         children: [
2439:                                             {
2440:                                                 id: 'art-2',
2441:                                                 title: lang === 'ar' ? 'إعداد OAuth لموصلات بوابة العميل' : 'Setting Up OAuth for Client-Gate API Connectors',
2442:                                                 reason: lang === 'ar' ? 'بناءً على نشاط "Stripe 403"' : 'Based on "Stripe 403" activity',
2443:                                                 category: 'Developer APIs'
2444:                                             },
2445:                                             {
2446:                                                 id: 'art-4',
2447:                                                 title: lang === 'ar' ? 'التعامل مع تأخيرات تسليم بوابة الألياف البصرية' : 'Handling Fiber Gateway Delivery Delays',
2448:                                                 reason: lang === 'ar' ? 'بناءً على تذكرة الشحن الأخيرة' : 'Based on recent shipment ticket',
2449:                                                 category: 'Returns & Refunds'
2450:                                             }
2451:                                         ].map((rec)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
2452:                                                 onClick: ()=>{
2453:                                                     setSelectedArticleId(rec.id);
2454:                                                     setActiveSubScreen('customer_kb_article');
2455:                                                 },
2456:                                                 className: `flex items-center justify-between p-1.5 rounded-xl text-left group shrink-0 w-[85%] sm:w-auto snap-start ${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$design$2d$system$2f$tokens$2f$surfaces$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SURFACE_PANEL"]} ${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$design$2d$system$2f$tokens$2f$interactions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["INTERACTIVE_CARD"]} ${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$design$2d$system$2f$tokens$2f$interactions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SUPPORT_MICRO_TRANSITION"]}`,
2457:                                                 style: {
2458:                                                     textAlign: lang === 'ar' ? 'right' : 'left'
2459:                                                 },
2460:                                                 children: [
2461:                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2462:                                                         className: "flex items-center gap-2 truncate flex-1 mr-1.5",
2463:                                                         children: [
2464:                                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2465:                                                                 className: "p-1 bg-blue-500/10 rounded-lg shrink-0 group-hover:scale-105 transition-transform",
2466:                                                                 children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
2467:                                                                     className: "w-3.5 h-3.5 text-blue-600"
2468:                                                                 }, void 0, false, {
2469:                                                                     fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2470:                                                                     lineNumber: 956,
2471:                                                                     columnNumber: 25
2472:                                                                 }, this)
2473:                                                             }, void 0, false, {
2474:                                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2475:                                                                 lineNumber: 955,
2476:                                                                 columnNumber: 23
2477:                                                             }, this),
2478:                                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2479:                                                                 className: "truncate space-y-0.5",
2480:                                                                 children: [
2481:                                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
2482:                                                                         className: "block truncate text-[10px] font-extrabold text-slate-850 dark:text-white leading-tight",
2483:                                                                         children: rec.title
2484:                                                                     }, void 0, false, {
2485:                                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2486:                                                                         lineNumber: 959,
2487:                                                                         columnNumber: 25
2488:                                                                     }, this),
2489:                                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
2490:                                                                         className: "px-1 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-[6.5px] font-extrabold font-mono uppercase inline-block leading-none",
2491:                                                                         children: rec.reason
2492:                                                                     }, void 0, false, {
2493:                                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2494:                                                                         lineNumber: 962,
2495:                                                                         columnNumber: 25
2496:                                                                     }, this)
2497:                                                                 ]
2498:                                                             }, void 0, true, {
2499:                                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2500:                                                                 lineNumber: 958,
2501:                                                                 columnNumber: 23
2502:                                                             }, this)
2503:                                                         ]
2504:                                                     }, void 0, true, {
2505:                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2506:                                                         lineNumber: 954,
2507:                                                         columnNumber: 21
2508:                                                     }, this),
2509:                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
2510:                                                         className: "w-3 h-3 text-blue-500 shrink-0 rotate-180 group-hover:translate-x-0.5 transition-transform"
2511:                                                     }, void 0, false, {
2512:                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2513:                                                         lineNumber: 967,
2514:                                                         columnNumber: 21
2515:                                                     }, this)
2516:                                                 ]
2517:                                             }, rec.id, true, {
2518:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2519:                                                 lineNumber: 945,
2520:                                                 columnNumber: 19
2521:                                             }, this))
2522:                                     }, void 0, false, {
2523:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2524:                                         lineNumber: 930,
2525:                                         columnNumber: 15
2526:                                     }, this)
2527:                                 ]
2528:                             }, void 0, true, {
2529:                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2530:                                 lineNumber: 923,
2531:                                 columnNumber: 13
2532:                             }, this),
2533:                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2534:                                 className: "space-y-1.5",
2535:                                 children: [
2536:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2537:                                         className: "flex items-center gap-1.5 px-0.5",
2538:                                         children: [
2539:                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
2540:                                                 className: "w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"
2541:                                             }, void 0, false, {
2542:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2543:                                                 lineNumber: 976,
2544:                                                 columnNumber: 17
2545:                                             }, this),
2546:                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
2547:                                                 className: "text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider",
2548:                                                 children: lang === 'ar' ? 'مؤشرات الدعم النشطة' : 'Active Support Telemetry'
2549:                                             }, void 0, false, {
2550:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2551:                                                 lineNumber: 977,
2552:                                                 columnNumber: 17
2553:                                             }, this)
2554:                                         ]
2555:                                     }, void 0, true, {
2556:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2557:                                         lineNumber: 975,
2558:                                         columnNumber: 15
2559:                                     }, this),
2560:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2561:                                         className: "grid grid-cols-2 md:grid-cols-4 gap-1.5",
2562:                                         children: [
2563:                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2564:                                                 className: `flex items-center justify-between p-1.5 rounded-xl ${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$design$2d$system$2f$tokens$2f$surfaces$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SURFACE_PANEL"]} text-[10.5px] font-semibold min-h-[46px]`,
2565:                                                 children: [
2566:                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2567:                                                         className: "flex items-center gap-1.5 truncate",
2568:                                                         children: [
2569:                                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"], {
2570:                                                                 className: "w-3.5 h-3.5 text-blue-500 shrink-0"
2571:                                                             }, void 0, false, {
2572:                                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2573:                                                                 lineNumber: 986,
2574:                                                                 columnNumber: 21
2575:                                                             }, this),
2576:                                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2577:                                                                 className: "truncate",
2578:                                                                 children: [
2579:                                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
2580:                                                                         className: "block text-[7px] text-slate-400 font-bold uppercase font-mono leading-none mb-0.5",
2581:                                                                         children: lang === 'ar' ? 'التنبيهات' : 'Alerts'
2582:                                                                     }, void 0, false, {
2583:                                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2584:                                                                         lineNumber: 988,
2585:                                                                         columnNumber: 23
2586:                                                                     }, this),
2587:                                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
2588:                                                                         className: "font-extrabold text-[9.5px] text-slate-850 dark:text-white leading-tight",
2589:                                                                         children: [
2590:                                                                             alerts.filter((a)=>!a.dismissed && a.lifecycleState === 'active').length,
2591:                                                                             " ",
2592:                                                                             lang === 'ar' ? 'نشط' : 'Active'
2593:                                                                         ]
2594:                                                                     }, void 0, true, {
2595:                                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2596:                                                                         lineNumber: 991,
2597:                                                                         columnNumber: 23
2598:                                                                     }, this)
2599:                                                                 ]
2600:                                                             }, void 0, true, {
2601:                                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2602:                                                                 lineNumber: 987,
2603:                                                                 columnNumber: 21
2604:                                                             }, this)
2605:                                                         ]
2606:                                                     }, void 0, true, {
2607:                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2608:                                                         lineNumber: 985,
2609:                                                         columnNumber: 19
2610:                                                     }, this),
2611:                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
2612:                                                         onClick: ()=>setActiveSubScreen('customer_notifications'),
2613:                                                         className: "text-[8px] text-blue-500 hover:underline font-bold cursor-pointer shrink-0 ml-1",
2614:                                                         children: lang === 'ar' ? 'عرض' : 'View'
2615:                                                     }, void 0, false, {
2616:                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2617:                                                         lineNumber: 996,
2618:                                                         columnNumber: 19
2619:                                                     }, this)
2620:                                                 ]
2621:                                             }, void 0, true, {
2622:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2623:                                                 lineNumber: 984,
2624:                                                 columnNumber: 17
2625:                                             }, this),
2626:                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2627:                                                 className: `flex items-center gap-1.5 p-1.5 rounded-xl ${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$design$2d$system$2f$tokens$2f$surfaces$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SURFACE_PANEL"]} text-[10.5px] font-semibold truncate min-h-[46px]`,
2628:                                                 children: [
2629:                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
2630:                                                         className: "w-3.5 h-3.5 text-emerald-500 shrink-0 animate-pulse"
2631:                                                     }, void 0, false, {
2632:                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2633:                                                         lineNumber: 1006,
2634:                                                         columnNumber: 19
2635:                                                     }, this),
2636:                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2637:                                                         className: "truncate",
2638:                                                         children: [
2639:                                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
2640:                                                                 className: "block text-[7px] text-slate-400 font-bold uppercase font-mono leading-none mb-0.5",
2641:                                                                 children: lang === 'ar' ? 'الدعم المباشر' : 'Live Help'
2642:                                                             }, void 0, false, {
2643:                                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2644:                                                                 lineNumber: 1008,
2645:                                                                 columnNumber: 21
2646:                                                             }, this),
2647:                                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
2648:                                                                 className: "font-extrabold text-[9.5px] text-slate-850 dark:text-white leading-tight",
2649:                                                                 children: lang === 'ar' ? 'متصل (<2د)' : 'ONLINE (<2m Wait)'
2650:                                                             }, void 0, false, {
2651:                                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2652:                                                                 lineNumber: 1011,
2653:                                                                 columnNumber: 21
2654:                                                             }, this)
2655:                                                         ]
2656:                                                     }, void 0, true, {
2657:                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2658:                                                         lineNumber: 1007,
2659:                                                         columnNumber: 19
2660:                                                     }, this)
2661:                                                 ]
2662:                                             }, void 0, true, {
2663:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2664:                                                 lineNumber: 1005,
2665:                                                 columnNumber: 17
2666:                                             }, this),
2667:                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2668:                                                 className: `flex items-center justify-between p-1.5 rounded-xl ${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$design$2d$system$2f$tokens$2f$surfaces$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SURFACE_PANEL"]} text-[10.5px] font-semibold min-h-[46px]`,
2669:                                                 children: [
2670:                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2671:                                                         className: "flex items-center gap-1.5 truncate",
2672:                                                         children: [
2673:                                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
2674:                                                                 className: "w-3.5 h-3.5 text-emerald-500 shrink-0"
2675:                                                             }, void 0, false, {
2676:                                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2677:                                                                 lineNumber: 1020,
2678:                                                                 columnNumber: 21
2679:                                                             }, this),
2680:                                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2681:                                                                 className: "truncate",
2682:                                                                 children: [
2683:                                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
2684:                                                                         className: "block text-[7px] text-slate-400 font-bold uppercase font-mono leading-none mb-0.5",
2685:                                                                         children: lang === 'ar' ? 'الالتزام بـ SLA' : 'SLA Target'
2686:                                                                     }, void 0, false, {
2687:                                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2688:                                                                         lineNumber: 1022,
2689:                                                                         columnNumber: 23
2690:                                                                     }, this),
2691:                                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
2692:                                                                         className: "font-mono font-extrabold text-[9.5px] text-emerald-600 dark:text-emerald-400 leading-tight",
2693:                                                                         children: "99.98% OK"
2694:                                                                     }, void 0, false, {
2695:                                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2696:                                                                         lineNumber: 1025,
2697:                                                                         columnNumber: 23
2698:                                                                     }, this)
2699:                                                                 ]
2700:                                                             }, void 0, true, {
2701:                                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2702:                                                                 lineNumber: 1021,
2703:                                                                 columnNumber: 21
2704:                                                             }, this)
2705:                                                         ]
2706:                                                     }, void 0, true, {
2707:                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2708:                                                         lineNumber: 1019,
2709:                                                         columnNumber: 19
2710:                                                     }, this),
2711:                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
2712:                                                         className: "px-1 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-[6.5px] font-bold shrink-0",
2713:                                                         children: lang === 'ar' ? 'مستقر' : 'OK'
2714:                                                     }, void 0, false, {
2715:                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2716:                                                         lineNumber: 1030,
2717:                                                         columnNumber: 19
2718:                                                     }, this)
2719:                                                 ]
2720:                                             }, void 0, true, {
2721:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2722:                                                 lineNumber: 1018,
2723:                                                 columnNumber: 17
2724:                                             }, this),
2725:                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2726:                                                 className: `flex items-center justify-between p-1.5 rounded-xl ${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$design$2d$system$2f$tokens$2f$surfaces$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SURFACE_PANEL"]} text-[10.5px] font-semibold min-h-[46px]`,
2727:                                                 children: [
2728:                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2729:                                                         className: "flex items-center gap-1.5 truncate",
2730:                                                         children: [
2731:                                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$list$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardList$3e$__["ClipboardList"], {
2732:                                                                 className: "w-3.5 h-3.5 text-pink-500 shrink-0"
2733:                                                             }, void 0, false, {
2734:                                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2735:                                                                 lineNumber: 1038,
2736:                                                                 columnNumber: 21
2737:                                                             }, this),
2738:                                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2739:                                                                 className: "truncate",
2740:                                                                 children: [
2741:                                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
2742:                                                                         className: "block text-[7px] text-slate-400 font-bold uppercase font-mono leading-none mb-0.5",
2743:                                                                         children: lang === 'ar' ? 'آخر تذكرة' : 'Last Case'
2744:                                                                     }, void 0, false, {
2745:                                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2746:                                                                         lineNumber: 1040,
2747:                                                                         columnNumber: 23
2748:                                                                     }, this),
2749:                                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
2750:                                                                         className: "font-extrabold text-[9.5px] text-slate-850 dark:text-white leading-tight truncate block max-w-[90px]",
2751:                                                                         children: tickets.filter((t)=>t.customerEmail === 'david.miller@yahoo.com')[0]?.title || (lang === 'ar' ? 'لا يوجد' : 'None')
2752:                                                                     }, void 0, false, {
2753:                                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2754:                                                                         lineNumber: 1043,
2755:                                                                         columnNumber: 23
2756:                                                                     }, this)
2757:                                                                 ]
2758:                                                             }, void 0, true, {
2759:                                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2760:                                                                 lineNumber: 1039,
2761:                                                                 columnNumber: 21
2762:                                                             }, this)
2763:                                                         ]
2764:                                                     }, void 0, true, {
2765:                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2766:                                                         lineNumber: 1037,
2767:                                                         columnNumber: 19
2768:                                                     }, this),
2769:                                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
2770:                                                         onClick: ()=>setActiveSubScreen('customer_my_tickets'),
2771:                                                         className: "text-[8px] text-blue-500 hover:underline font-bold shrink-0 cursor-pointer ml-1",
2772:                                                         children: lang === 'ar' ? 'الكل' : 'All'
2773:                                                     }, void 0, false, {
2774:                                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2775:                                                         lineNumber: 1048,
2776:                                                         columnNumber: 19
2777:                                                     }, this)
2778:                                                 ]
2779:                                             }, void 0, true, {
2780:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2781:                                                 lineNumber: 1036,
2782:                                                 columnNumber: 17
2783:                                             }, this)
2784:                                         ]
2785:                                     }, void 0, true, {
2786:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2787:                                         lineNumber: 981,
2788:                                         columnNumber: 15
2789:                                     }, this)
2790:                                 ]
2791:                             }, void 0, true, {
2792:                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2793:                                 lineNumber: 974,
2794:                                 columnNumber: 13
2795:                             }, this),
2796:                             callbackQueued && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2797:                                 className: "pt-2 border-t border-slate-100 dark:border-slate-850",
2798:                                 children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$feedback$2f$CallbackQueueCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CallbackQueueCard"], {
2799:                                     lang: lang,
2800:                                     phoneNumber: callbackPhone,
2801:                                     onToastTrigger: pushToast
2802:                                 }, void 0, false, {
2803:                                     fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2804:                                     lineNumber: 1061,
2805:                                     columnNumber: 17
2806:                                 }, this)
2807:                             }, void 0, false, {
2808:                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2809:                                 lineNumber: 1060,
2810:                                 columnNumber: 15
2811:                             }, this)
2812:                         ]
2813:                     }, void 0, true, {
2814:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2815:                         lineNumber: 641,
2816:                         columnNumber: 11
2817:                     }, this),
2818:                     activeSubScreen === 'customer_kb' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$ai$2d$copilot$2f$AIWorkspace$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AIWorkspace"], {}, void 0, false, {
2819:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2820:                         lineNumber: 1072,
2821:                         columnNumber: 11
2822:                     }, this),
2823:                     activeSubScreen === 'customer_kb_article' && (selectedArticleId ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$knowledge$2d$base$2f$KbArticleView$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["KbArticleView"], {
2824:                         kbArticles: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$shared$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["kbArticles"],
2825:                         selectedArticleId: selectedArticleId,
2826:                         setSelectedArticleId: setSelectedArticleId,
2827:                         setActiveSubScreen: setActiveSubScreen,
2828:                         articleFeedbackGiven: articleFeedbackGiven,
2829:                         handleArticleHelpful: handleArticleHelpful
2830:                     }, void 0, false, {
2831:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2832:                         lineNumber: 1077,
2833:                         columnNumber: 13
2834:                     }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$knowledge$2d$base$2f$KbSearch$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["KbSearch"], {
2835:                         kbArticles: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$shared$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["kbArticles"],
2836:                         searchQuery: searchQuery,
2837:                         setSearchQuery: setSearchQuery,
2838:                         kbCategoryFilter: kbCategoryFilter,
2839:                         setKbCategoryFilter: setKbCategoryFilter,
2840:                         setSelectedArticleId: setSelectedArticleId,
2841:                         setActiveSubScreen: setActiveSubScreen
2842:                     }, void 0, false, {
2843:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2844:                         lineNumber: 1086,
2845:                         columnNumber: 13
2846:                     }, this)),
2847:                     activeSubScreen === 'customer_ticket_detail' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$tickets$2f$TicketDetail$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TicketDetail"], {
2848:                         tickets: tickets,
2849:                         selectedTicketId: selectedTicketId,
2850:                         setActiveSubScreen: setActiveSubScreen,
2851:                         ticketReplyText: ticketReplyText,
2852:                         setTicketReplyText: setTicketReplyText,
2853:                         handlePostReply: handlePostReply
2854:                     }, void 0, false, {
2855:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2856:                         lineNumber: 1099,
2857:                         columnNumber: 11
2858:                     }, this),
2859:                     activeSubScreen === 'customer_ticket_submit' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$tickets$2f$SubmitTicketPage$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SubmitTicketPage"], {
2860:                         ticketTitle: ticketTitle,
2861:                         setTicketTitle: setTicketTitle,
2862:                         ticketCategory: ticketCategory,
2863:                         setTicketCategory: setTicketCategory,
2864:                         ticketPriority: ticketPriority,
2865:                         setTicketPriority: setTicketPriority,
2866:                         ticketDesc: ticketDesc,
2867:                         setTicketDesc: setTicketDesc,
2868:                         handleTicketSubmit: handleTicketSubmit,
2869:                         onBack: ()=>setActiveSubScreen('customer_home')
2870:                     }, void 0, false, {
2871:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2872:                         lineNumber: 1110,
2873:                         columnNumber: 11
2874:                     }, this),
2875:                     activeSubScreen === 'customer_order_refund' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$refunds$2f$RefundWizard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RefundWizard"], {
2876:                         setActiveSubScreen: setActiveSubScreen,
2877:                         otpStep: otpStep,
2878:                         setOtpStep: setOtpStep,
2879:                         lookupEmail: lookupEmail,
2880:                         setLookupEmail: setLookupEmail,
2881:                         lookupOtp: lookupOtp,
2882:                         setLookupOtp: setLookupOtp,
2883:                         lookupOrderNum: lookupOrderNum,
2884:                         refundStep: refundStep,
2885:                         setRefundStep: setRefundStep,
2886:                         refundReason: refundReason,
2887:                         setRefundReason: setRefundReason,
2888:                         refundAttachment: refundAttachment,
2889:                         setRefundAttachment: setRefundAttachment,
2890:                         handleOtpRequest: handleOtpRequest,
2891:                         handleVerifyOtp: handleVerifyOtp,
2892:                         otpError: otpError,
2893:                         setOtpError: setOtpError
2894:                     }, void 0, false, {
2895:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2896:                         lineNumber: 1125,
2897:                         columnNumber: 11
2898:                     }, this),
2899:                     activeSubScreen === 'customer_my_tickets' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$tickets$2f$TicketList$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TicketList"], {
2900:                         tickets: tickets,
2901:                         setSelectedTicketId: setSelectedTicketId,
2902:                         setActiveSubScreen: setActiveSubScreen
2903:                     }, void 0, false, {
2904:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2905:                         lineNumber: 1148,
2906:                         columnNumber: 11
2907:                     }, this),
2908:                     activeSubScreen === 'customer_chat_history' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$shared$2f$CustomerChatHistory$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CustomerChatHistory"], {
2909:                         historicalChats: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$shared$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["historicalChats"],
2910:                         setActiveSubScreen: setActiveSubScreen
2911:                     }, void 0, false, {
2912:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2913:                         lineNumber: 1156,
2914:                         columnNumber: 11
2915:                     }, this),
2916:                     activeSubScreen === 'customer_feedback_hub' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$feedback$2f$FeedbackHubPage$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FeedbackHubPage"], {
2917:                         lang: lang,
2918:                         onBack: ()=>setActiveSubScreen('customer_home'),
2919:                         pushToast: pushToast
2920:                     }, void 0, false, {
2921:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2922:                         lineNumber: 1163,
2923:                         columnNumber: 11
2924:                     }, this),
2925:                     activeSubScreen === 'customer_notifications' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$notifications$2f$CustomerNotifications$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CustomerNotifications"], {}, void 0, false, {
2926:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2927:                         lineNumber: 1171,
2928:                         columnNumber: 11
2929:                     }, this),
2930:                     activeSubScreen === 'customer_live_support' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$support$2f$LiveSupportWorkspace$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LiveSupportWorkspace"], {}, void 0, false, {
2931:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2932:                         lineNumber: 1175,
2933:                         columnNumber: 11
2934:                     }, this),
2935:                     activeSubScreen === 'customer_recent_activity' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$shared$2f$PersonalizationHub$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RecentActivityPage"], {}, void 0, false, {
2936:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2937:                         lineNumber: 1179,
2938:                         columnNumber: 11
2939:                     }, this),
2940:                     activeSubScreen === 'customer_favorites' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$shared$2f$PersonalizationHub$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FavoritesPage"], {
2941:                         onSelectArticle: (id)=>{
2942:                             setSelectedArticleId(id);
2943:                             setActiveSubScreen('customer_kb_article');
2944:                         }
2945:                     }, void 0, false, {
2946:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2947:                         lineNumber: 1183,
2948:                         columnNumber: 11
2949:                     }, this),
2950:                     activeSubScreen === 'customer_system_status' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$status$2f$SystemStatusPage$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SystemStatusPage"], {
2951:                         setActiveSubScreen: setActiveSubScreen
2952:                     }, void 0, false, {
2953:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2954:                         lineNumber: 1192,
2955:                         columnNumber: 11
2956:                     }, this),
2957:                     activeSubScreen === 'customer_settings' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$settings$2f$CustomerSettings$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CustomerSettings"], {}, void 0, false, {
2958:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2959:                         lineNumber: 1196,
2960:                         columnNumber: 11
2961:                     }, this),
2962:                     activeSubScreen === 'customer_system_403' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$shared$2f$EnterpriseStates$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HttpStatusPage"], {
2963:                         status: "403",
2964:                         onBack: ()=>setActiveSubScreen('customer_home')
2965:                     }, void 0, false, {
2966:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2967:                         lineNumber: 1200,
2968:                         columnNumber: 11
2969:                     }, this),
2970:                     activeSubScreen === 'customer_system_404' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$shared$2f$EnterpriseStates$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HttpStatusPage"], {
2971:                         status: "404",
2972:                         onBack: ()=>setActiveSubScreen('customer_home')
2973:                     }, void 0, false, {
2974:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2975:                         lineNumber: 1204,
2976:                         columnNumber: 11
2977:                     }, this),
2978:                     activeSubScreen === 'customer_system_500' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$shared$2f$EnterpriseStates$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HttpStatusPage"], {
2979:                         status: "500",
2980:                         onBack: ()=>setActiveSubScreen('customer_home')
2981:                     }, void 0, false, {
2982:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2983:                         lineNumber: 1208,
2984:                         columnNumber: 11
2985:                     }, this),
2986:                     activeSubScreen === 'customer_system_maintenance' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$shared$2f$EnterpriseStates$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MaintenanceModeScreen"], {}, void 0, false, {
2987:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
2988:                         lineNumber: 1212,
2989:                         columnNumber: 11
2990:                     }, this),
2991:                     activeSubScreen === 'customer_org_switcher' && (canAccessGovernance ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2992:                         className: "space-y-6 animate-in fade-in duration-200",
2993:                         children: [
2994:                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
2995:                                 className: "flex items-center gap-3",
2996:                                 children: [
2997:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
2998:                                         type: "button",
2999:                                         onClick: ()=>setActiveSubScreen('customer_home'),
3000:                                         className: "p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer",
3001:                                         children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
3002:                                             className: `w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`
3003:                                         }, void 0, false, {
3004:                                             fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3005:                                             lineNumber: 1231,
3006:                                             columnNumber: 19
3007:                                         }, this)
3008:                                     }, void 0, false, {
3009:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3010:                                         lineNumber: 1226,
3011:                                         columnNumber: 17
3012:                                     }, this),
3013:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
3014:                                         children: [
3015:                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
3016:                                                 className: "text-base font-bold text-slate-900 dark:text-white leading-tight",
3017:                                                 children: lang === 'ar' ? 'إعدادات المؤسسة وبيئة العمل' : 'Workspace & Tenant Settings'
3018:                                             }, void 0, false, {
3019:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3020:                                                 lineNumber: 1234,
3021:                                                 columnNumber: 19
3022:                                             }, this),
3023:                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
3024:                                                 className: "text-[10px] text-slate-450 dark:text-slate-455 font-semibold block mt-0.5",
3025:                                                 children: lang === 'ar' ? 'تبديل بين بيئات المؤسسة وإدارة الجلسات النشطة.' : 'Switch between organizational environments and manage active device sessions.'
3026:                                             }, void 0, false, {
3027:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3028:                                                 lineNumber: 1237,
3029:                                                 columnNumber: 19
3030:                                             }, this)
3031:                                         ]
3032:                                     }, void 0, true, {
3033:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3034:                                         lineNumber: 1233,
3035:                                         columnNumber: 17
3036:                                     }, this)
3037:                                 ]
3038:                             }, void 0, true, {
3039:                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3040:                                 lineNumber: 1225,
3041:                                 columnNumber: 15
3042:                             }, this),
3043:                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
3044:                                 className: "grid grid-cols-1 md:grid-cols-3 gap-6 items-start",
3045:                                 children: [
3046:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
3047:                                         className: "md:col-span-1 space-y-4",
3048:                                         children: [
3049:                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
3050:                                                 className: "block text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider",
3051:                                                 children: lang === 'ar' ? 'مبدل بيئة العمل' : 'Active Tenant Select'
3052:                                             }, void 0, false, {
3053:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3054:                                                 lineNumber: 1246,
3055:                                                 columnNumber: 19
3056:                                             }, this),
3057:                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$enterprise$2f$OrgSwitcher$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OrgSwitcher"], {}, void 0, false, {
3058:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3059:                                                 lineNumber: 1249,
3060:                                                 columnNumber: 19
3061:                                             }, this)
3062:                                         ]
3063:                                     }, void 0, true, {
3064:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3065:                                         lineNumber: 1245,
3066:                                         columnNumber: 17
3067:                                     }, this),
3068:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
3069:                                         className: "md:col-span-2",
3070:                                         children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$enterprise$2f$ActiveSessionsPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ActiveSessionsPanel"], {}, void 0, false, {
3071:                                             fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3072:                                             lineNumber: 1252,
3073:                                             columnNumber: 19
3074:                                         }, this)
3075:                                     }, void 0, false, {
3076:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3077:                                         lineNumber: 1251,
3078:                                         columnNumber: 17
3079:                                     }, this)
3080:                                 ]
3081:                             }, void 0, true, {
3082:                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3083:                                 lineNumber: 1244,
3084:                                 columnNumber: 15
3085:                             }, this)
3086:                         ]
3087:                     }, void 0, true, {
3088:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3089:                         lineNumber: 1224,
3090:                         columnNumber: 13
3091:                     }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$shared$2f$EnterpriseStates$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HttpStatusPage"], {
3092:                         status: "403",
3093:                         onBack: ()=>setActiveSubScreen('customer_home')
3094:                     }, void 0, false, {
3095:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3096:                         lineNumber: 1257,
3097:                         columnNumber: 13
3098:                     }, this)),
3099:                     activeSubScreen === 'customer_audit_logs' && (canAccessGovernance ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$enterprise$2f$AuditLogViewer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AuditLogViewer"], {
3100:                         onBack: ()=>setActiveSubScreen('customer_home')
3101:                     }, void 0, false, {
3102:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3103:                         lineNumber: 1263,
3104:                         columnNumber: 13
3105:                     }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$shared$2f$EnterpriseStates$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HttpStatusPage"], {
3106:                         status: "403",
3107:                         onBack: ()=>setActiveSubScreen('customer_home')
3108:                     }, void 0, false, {
3109:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3110:                         lineNumber: 1265,
3111:                         columnNumber: 13
3112:                     }, this)),
3113:                     activeSubScreen === 'customer_exports' && (canAccessGovernance ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
3114:                         className: "space-y-6 animate-in fade-in duration-200",
3115:                         children: [
3116:                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
3117:                                 className: "flex items-center gap-3",
3118:                                 children: [
3119:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
3120:                                         type: "button",
3121:                                         onClick: ()=>setActiveSubScreen('customer_home'),
3122:                                         className: "p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer",
3123:                                         children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
3124:                                             className: `w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`
3125:                                         }, void 0, false, {
3126:                                             fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3127:                                             lineNumber: 1278,
3128:                                             columnNumber: 19
3129:                                         }, this)
3130:                                     }, void 0, false, {
3131:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3132:                                         lineNumber: 1273,
3133:                                         columnNumber: 17
3134:                                     }, this),
3135:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
3136:                                         children: [
3137:                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
3138:                                                 className: "text-base font-bold text-slate-900 dark:text-white leading-tight",
3139:                                                 children: lang === 'ar' ? 'مركز الامتثال وتصدير البيانات' : 'Compliance Snapshots & Export'
3140:                                             }, void 0, false, {
3141:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3142:                                                 lineNumber: 1281,
3143:                                                 columnNumber: 19
3144:                                             }, this),
3145:                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
3146:                                                 className: "text-[10px] text-slate-450 dark:text-slate-455 font-semibold block mt-0.5",
3147:                                                 children: lang === 'ar' ? 'قم بتوليد وتحميل نسخ مشفرة من سجلات التدقيق والدلائل للجهات الخارجية.' : 'Request signed audit log datasets or user seat metadata collections for external audits.'
3148:                                             }, void 0, false, {
3149:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3150:                                                 lineNumber: 1284,
3151:                                                 columnNumber: 19
3152:                                             }, this)
3153:                                         ]
3154:                                     }, void 0, true, {
3155:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3156:                                         lineNumber: 1280,
3157:                                         columnNumber: 17
3158:                                     }, this)
3159:                                 ]
3160:                             }, void 0, true, {
3161:                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3162:                                 lineNumber: 1272,
3163:                                 columnNumber: 15
3164:                             }, this),
3165:                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$enterprise$2f$ExportCenter$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ExportCenter"], {}, void 0, false, {
3166:                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3167:                                 lineNumber: 1291,
3168:                                 columnNumber: 15
3169:                             }, this)
3170:                         ]
3171:                     }, void 0, true, {
3172:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3173:                         lineNumber: 1271,
3174:                         columnNumber: 13
3175:                     }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$shared$2f$EnterpriseStates$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HttpStatusPage"], {
3176:                         status: "403",
3177:                         onBack: ()=>setActiveSubScreen('customer_home')
3178:                     }, void 0, false, {
3179:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3180:                         lineNumber: 1294,
3181:                         columnNumber: 13
3182:                     }, this)),
3183:                     activeSubScreen === 'customer_sso_status' && (canAccessGovernance ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
3184:                         className: "space-y-6 animate-in fade-in duration-200",
3185:                         children: [
3186:                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
3187:                                 className: "flex items-center gap-3",
3188:                                 children: [
3189:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
3190:                                         type: "button",
3191:                                         onClick: ()=>setActiveSubScreen('customer_home'),
3192:                                         className: "p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer",
3193:                                         children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
3194:                                             className: `w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`
3195:                                         }, void 0, false, {
3196:                                             fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3197:                                             lineNumber: 1307,
3198:                                             columnNumber: 19
3199:                                         }, this)
3200:                                     }, void 0, false, {
3201:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3202:                                         lineNumber: 1302,
3203:                                         columnNumber: 17
3204:                                     }, this),
3205:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
3206:                                         children: [
3207:                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
3208:                                                 className: "text-base font-bold text-slate-900 dark:text-white leading-tight",
3209:                                                 children: lang === 'ar' ? 'مراقبة الربط الموحد (SSO)' : 'SSO Connection & Federation'
3210:                                             }, void 0, false, {
3211:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3212:                                                 lineNumber: 1310,
3213:                                                 columnNumber: 19
3214:                                             }, this),
3215:                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
3216:                                                 className: "text-[10px] text-slate-450 dark:text-slate-455 font-semibold block mt-0.5",
3217:                                                 children: lang === 'ar' ? 'مراقبة زمن استجابة الـ IdP، والتحقق من صلاحية شهادات SAML/OIDC النشطة.' : 'Monitor federation latency, success rates, and active identity provider configurations.'
3218:                                             }, void 0, false, {
3219:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3220:                                                 lineNumber: 1313,
3221:                                                 columnNumber: 19
3222:                                             }, this)
3223:                                         ]
3224:                                     }, void 0, true, {
3225:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3226:                                         lineNumber: 1309,
3227:                                         columnNumber: 17
3228:                                     }, this)
3229:                                 ]
3230:                             }, void 0, true, {
3231:                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3232:                                 lineNumber: 1301,
3233:                                 columnNumber: 15
3234:                             }, this),
3235:                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$enterprise$2f$SsoStatusPanel$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SsoStatusPanel"], {}, void 0, false, {
3236:                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3237:                                 lineNumber: 1320,
3238:                                 columnNumber: 15
3239:                             }, this)
3240:                         ]
3241:                     }, void 0, true, {
3242:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3243:                         lineNumber: 1300,
3244:                         columnNumber: 13
3245:                     }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$shared$2f$EnterpriseStates$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HttpStatusPage"], {
3246:                         status: "403",
3247:                         onBack: ()=>setActiveSubScreen('customer_home')
3248:                     }, void 0, false, {
3249:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3250:                         lineNumber: 1323,
3251:                         columnNumber: 13
3252:                     }, this)),
3253:                     activeSubScreen === 'customer_quotas' && (canAccessGovernance ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
3254:                         className: "space-y-6 animate-in fade-in duration-200",
3255:                         children: [
3256:                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
3257:                                 className: "flex items-center gap-3",
3258:                                 children: [
3259:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
3260:                                         type: "button",
3261:                                         onClick: ()=>setActiveSubScreen('customer_home'),
3262:                                         className: "p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer",
3263:                                         children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
3264:                                             className: `w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`
3265:                                         }, void 0, false, {
3266:                                             fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3267:                                             lineNumber: 1336,
3268:                                             columnNumber: 19
3269:                                         }, this)
3270:                                     }, void 0, false, {
3271:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3272:                                         lineNumber: 1331,
3273:                                         columnNumber: 17
3274:                                     }, this),
3275:                                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
3276:                                         children: [
3277:                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
3278:                                                 className: "text-base font-bold text-slate-900 dark:text-white leading-tight",
3279:                                                 children: lang === 'ar' ? 'قياسات الحصة والترخيص' : 'Telemetry & Limit Quotas'
3280:                                             }, void 0, false, {
3281:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3282:                                                 lineNumber: 1339,
3283:                                                 columnNumber: 19
3284:                                             }, this),
3285:                                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
3286:                                                 className: "text-[10px] text-slate-450 dark:text-slate-455 font-semibold block mt-0.5",
3287:                                                 children: lang === 'ar' ? 'استعراض معدلات الاستخدام للـ API، والرسائل، والجلسات المصرح بها.' : 'Review API call rates, message throughput, and licensed session consumption metrics.'
3288:                                             }, void 0, false, {
3289:                                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3290:                                                 lineNumber: 1342,
3291:                                                 columnNumber: 19
3292:                                             }, this)
3293:                                         ]
3294:                                     }, void 0, true, {
3295:                                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3296:                                         lineNumber: 1338,
3297:                                         columnNumber: 17
3298:                                     }, this)
3299:                                 ]
3300:                             }, void 0, true, {
3301:                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3302:                                 lineNumber: 1330,
3303:                                 columnNumber: 15
3304:                             }, this),
3305:                             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$enterprise$2f$QuotaDashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QuotaDashboard"], {}, void 0, false, {
3306:                                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3307:                                 lineNumber: 1349,
3308:                                 columnNumber: 15
3309:                             }, this)
3310:                         ]
3311:                     }, void 0, true, {
3312:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3313:                         lineNumber: 1329,
3314:                         columnNumber: 13
3315:                     }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$shared$2f$EnterpriseStates$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HttpStatusPage"], {
3316:                         status: "403",
3317:                         onBack: ()=>setActiveSubScreen('customer_home')
3318:                     }, void 0, false, {
3319:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3320:                         lineNumber: 1352,
3321:                         columnNumber: 13
3322:                     }, this))
3323:                 ]
3324:             }, void 0, true, {
3325:                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3326:                 lineNumber: 639,
3327:                 columnNumber: 7
3328:             }, this),
3329:             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$accessibility$2f$AccessibilityWidget$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AccessibilityWidget"], {
3330:                 isOpen: showAccessibilityWidget,
3331:                 onClose: ()=>setShowAccessibilityWidget(false),
3332:                 fontSize: fontSize,
3333:                 setFontSize: setFontSize,
3334:                 highContrast: highContrast,
3335:                 setHighContrast: setHighContrast
3336:             }, void 0, false, {
3337:                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3338:                 lineNumber: 1358,
3339:                 columnNumber: 7
3340:             }, this),
3341:             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$callbacks$2f$VoiceCallModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VoiceCallModal"], {
3342:                 isOpen: showVoiceModal,
3343:                 onClose: ()=>setShowVoiceModal(false)
3344:             }, void 0, false, {
3345:                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3346:                 lineNumber: 1367,
3347:                 columnNumber: 7
3348:             }, this),
3349:             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$callbacks$2f$CobrowseModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CobrowseModal"], {
3350:                 isOpen: showCobrowseModal,
3351:                 onClose: ()=>setShowCobrowseModal(false),
3352:                 cobrowsePin: cobrowsePin,
3353:                 setCobrowsePin: setCobrowsePin,
3354:                 cobrowseConnected: cobrowseConnected,
3355:                 handleJoinCobrowse: handleJoinCobrowse
3356:             }, void 0, false, {
3357:                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3358:                 lineNumber: 1372,
3359:                 columnNumber: 7
3360:             }, this),
3361:             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$callbacks$2f$CallbackRequestModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CallbackRequestModal"], {
3362:                 isOpen: showCallbackModal,
3363:                 onClose: ()=>{
3364:                     setShowCallbackModal(false);
3365:                     if (!callbackQueued) setCallbackPhone('');
3366:                 },
3367:                 callbackPhone: callbackPhone,
3368:                 setCallbackPhone: setCallbackPhone,
3369:                 callbackTime: callbackTime,
3370:                 setCallbackTime: setCallbackTime,
3371:                 handleScheduleCallback: handleScheduleCallback
3372:             }, void 0, false, {
3373:                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3374:                 lineNumber: 1381,
3375:                 columnNumber: 7
3376:             }, this),
3377:             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$tickets$2f$SubmitTicketModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SubmitTicketModal"], {
3378:                 isOpen: showSubmitModal,
3379:                 onClose: ()=>setShowSubmitModal(false),
3380:                 ticketTitle: ticketTitle,
3381:                 setTicketTitle: setTicketTitle,
3382:                 ticketCategory: ticketCategory,
3383:                 setTicketCategory: setTicketCategory,
3384:                 ticketPriority: ticketPriority,
3385:                 setTicketPriority: setTicketPriority,
3386:                 ticketDesc: ticketDesc,
3387:                 setTicketDesc: setTicketDesc,
3388:                 handleTicketSubmit: handleTicketSubmit
3389:             }, void 0, false, {
3390:                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3391:                 lineNumber: 1394,
3392:                 columnNumber: 7
3393:             }, this),
3394:             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$live$2d$chat$2f$LiveChatOverlay$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LiveChatOverlay"], {
3395:                 chatOpen: chatOpen,
3396:                 setChatOpen: setChatOpen,
3397:                 chatInput: chatInput,
3398:                 setChatInput: setChatInput,
3399:                 chatLanguage: chatLanguage,
3400:                 setChatLanguage: setChatLanguage,
3401:                 chatMessages: chatMessages,
3402:                 setChatMessages: setChatMessages,
3403:                 chatStatus: chatStatus,
3404:                 setChatStatus: setChatStatus,
3405:                 queuePos: queuePos,
3406:                 setQueuePos: setQueuePos,
3407:                 surveyCsat: surveyCsat,
3408:                 setSurveyCsat: setSurveyCsat,
3409:                 surveyNps: surveyNps,
3410:                 setSurveyNps: setSurveyNps,
3411:                 transcriptEmail: transcriptEmail,
3412:                 setTranscriptEmail: setTranscriptEmail,
3413:                 handleSendChatMessage: handleSendChatMessage
3414:             }, void 0, false, {
3415:                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3416:                 lineNumber: 1408,
3417:                 columnNumber: 7
3418:             }, this),
3419:             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$navigation$2f$GlobalSearch$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GlobalSearch"], {
3420:                 isOpen: globalSearchOpen,
3421:                 onClose: ()=>setGlobalSearchOpen(false),
3422:                 setActiveSubScreen: setActiveSubScreen,
3423:                 setSelectedArticleId: (id)=>setSelectedArticleId(id),
3424:                 setSelectedTicketId: (id)=>setSelectedTicketId(id),
3425:                 onTriggerAction: (action)=>{
3426:                     if (action === 'open_ticket_modal') setShowSubmitModal(true);
3427:                     else if (action === 'open_callback_modal') setShowCallbackModal(true);
3428:                     else if (action === 'open_voice_modal') setShowVoiceModal(true);
3429:                     else if (action === 'open_cobrowse_modal') setShowCobrowseModal(true);
3430:                     else if (action === 'toggle_accessibility') setShowAccessibilityWidget(true);
3431:                     else if (action === 'change_accent_blue') setAccentColor('blue');
3432:                     else if (action === 'change_accent_indigo') setAccentColor('indigo');
3433:                     else if (action === 'change_accent_emerald') setAccentColor('emerald');
3434:                     setGlobalSearchOpen(false);
3435:                 }
3436:             }, void 0, false, {
3437:                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3438:                 lineNumber: 1431,
3439:                 columnNumber: 7
3440:             }, this),
3441:             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$src$2f$components$2f$customer$2d$portal$2f$enterprise$2f$SessionTimeoutModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SessionTimeoutModal"], {
3442:                 isOpen: showTimeoutModal,
3443:                 timeLeftSeconds: sessionTimeLeft,
3444:                 onExtend: ()=>{
3445:                     setSessionTimeLeft(900);
3446:                     setShowTimeoutModal(false);
3447:                     addAuditLog('Customer extended active security session manually', 'success');
3448:                     pushToast('success', lang === 'ar' ? 'تم تمديد الجلسة' : 'Session Extended', lang === 'ar' ? 'تم تجديد وقت جلسة العمل بنجاح.' : 'Your active security token was successfully refreshed.');
3449:                 },
3450:                 onLogout: ()=>{
3451:                     setSessionTimeLeft(900);
3452:                     setShowTimeoutModal(false);
3453:                     addAuditLog('Customer terminated active security session manually', 'failed');
3454:                     setActiveSubScreen('customer_system_403');
3455:                 },
3456:                 lang: lang
3457:             }, void 0, false, {
3458:                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3459:                 lineNumber: 1451,
3460:                 columnNumber: 7
3461:             }, this),
3462:             submitSuccessMessage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
3463:                 className: "fixed bottom-24 right-6 z-50 bg-emerald-650 text-white font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-500 animate-bounce text-xs font-mono",
3464:                 children: [
3465:                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
3466:                         className: "w-4 h-4"
3467:                     }, void 0, false, {
3468:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3469:                         lineNumber: 1475,
3470:                         columnNumber: 11
3471:                     }, this),
3472:                     /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
3473:                         children: submitSuccessMessage
3474:                     }, void 0, false, {
3475:                         fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3476:                         lineNumber: 1476,
3477:                         columnNumber: 11
3478:                     }, this)
3479:                 ]
3480:             }, void 0, true, {
3481:                 fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3482:                 lineNumber: 1474,
3483:                 columnNumber: 9
3484:             }, this),
3485:             /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
3486:                 className: "fixed bottom-6 left-6 z-30",
3487:                 children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
3488:                     onClick: ()=>setShowVoiceModal(true),
3489:                     className: "flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white font-bold rounded-full shadow-lg text-[10px] hover:bg-emerald-700 font-mono transition-all hover:scale-105 active:scale-95",
3490:                     children: [
3491:                         /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Volume2$3e$__["Volume2"], {
3492:                             className: "w-4 h-4"
3493:                         }, void 0, false, {
3494:                             fileName: "[project]/Desktop/CustomerSelfService/frontend/src/components/customer-portal/shared/CustomerPortalLayout.tsx",
3495:                             lineNumber: 1486,
3496:                             columnNumber: 11
3497:                         }, this),
3498:                         /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$CustomerSelfService$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
3499:                             children: t.portal.homeHero.hotline
3500:                         }, void 0, false, {
