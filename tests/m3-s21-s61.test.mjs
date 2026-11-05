import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState,
  createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Independent EP05/S21+S61 exact source counts/hashes. Only technical
// headings/transitions are omitted; S61 common last S22 token is removed.
const sourceProof={
  's21-intro': [7, '95ceab405aeca833ca7a0c99279117c63a192742fe13ce865c9be05887d3a31e'],
  's21-choice-note': [1, '3bf2eb7da426371f27cb0316cec857f905b61615568a7b3854ffe3c77a452e8c'],
  's21-people': [2, '1d50e9a0c1c6c99278c6d6c6627746c4480c82a235bab1b06463c241de32c422'],
  's21-place': [2, '607f90bec2dcbeb5530f7e389eeb4d9aa6181d89a58af6cc61f00add815259f5'],
  's21-own': [2, '1a4f97ed734b6cdfabb219b15e5882489de575c71b478ec2fe6f420e5ec1de8a'],
  's21-common': [3, '96527bb1606634a1b75007f2a7320cf193c5f08a00f28107a7d561727a866131'],
  's21-m-a': [1, 'adbb1de2f55cfb681ae4c0701f9321ede76ec57a194662e503064e680ecf33a6'],
  's21-m-b': [1, '0a7a5bfbd70051b14224d55a7fb1db06f49780430268e2730831ad267dada303'],
  's21-m-c': [1, '579260ed9d1675506b63cc41ff011055d03cd5f942ec9b4c40d8f9c1e8ee44d9'],
  's21-friend': [1, '36e329b5ce53f8cf2a8cfa386b4916d76dce30498fdffa85c15454ca9d8a795f'],
  's21-bookstore': [1, 'c847dd40fb4bb9a660eb872170d80848fab9948e7365c315cbb5a02bf6f2ca4b'],
  's61-intro': [12, '182c62d6e1408e64975cfbe9f2f976216ce62d73bf88dd3cc6dfa2645c78268d'],
  's61-r-a': [3, 'ecd0d644a8b6c29f6052c1bdaab090826ab16bdefc7d3e1c08aa477240063b7f'],
  's61-r-b': [3, '3110efaee49def0791b08f2e7180be796035f41dd496ec7653118a458725c2eb'],
  's61-r-c': [3, '8429dd08ea62838ac30095035cc42ad62a27b389f6bab3b2956ad2a149c3618d'],
  's61-common-a': [2, '0d592659e615710a395040910dcfd925ffa3f91f2fadc6cbee651f501eb87fc1'],
  's61-stay-alone': [2, '2298f45a17c17997f42b004db8552098cf92a81f92dde7dce64656c75aad284c'],
  's61-rejoin': [6, '6287d641287cb6caa82d47aeff25c435b9aa5927458ec6b216269a1e9736d556'],
  's61-common-b': [1, '4c97b4f454b3b39f994d0482c24c9b69b30f23fffd30bbb8ad87ecaaff126dbc'],
  's61-friend': [1, '49441a907470c78a1f3ffcfbb7a0a7cf010154d11d1e78573781c13412652a54'],
  's61-bookstore': [1, '1f50576df27cd447b8741a200d4ccc4c5d7609c11e89d153ef251509d82eca3c'],
};
const scene=id=>graphData.scenes.find(s=>s.id===id);
const shown=id=>(scene(id)?.beats??[]).filter(b=>b.type==='dialogue').map(b=>b.text.ru);
const choice=(sid,bid)=>scene(sid)?.beats.find(b=>b.id===bid);

test('S21+S61 show all 21 exact authorial blocks and 56 paragraphs',()=>{
  assert.equal(Object.values(sourceProof).reduce((n,[c])=>n+c,0),56);
  for(const [id,[count,sha]] of Object.entries(sourceProof)){
    const paragraphs=shown(id);
    assert.equal(paragraphs.length,count,id);
    assert.equal(createHash('sha256').update(paragraphs.join('\n\n')).digest('hex'),sha,id);
    assert.ok(paragraphs.every(t=>!t.startsWith('Технический переход')&&
      !t.startsWith('Выбор S21-')&&!t.startsWith('Выбор S61-')&&!t.includes('Утром дня 11 — S22.')),id);
  }
  assert.equal(shown('s21-choice-note')[0],
    'Каждый вариант отправляется, а не остаётся бесконечным черновиком.');
  assert.doesNotThrow(()=>defineNarrativeGraph(graphData));
});

test('only S17 self enters S21, S61 mandatory; three free source choices and guarded callbacks',()=>{
  assert.deepEqual(choice('s17-common-b','s17-evening-choice').choices.map(c=>[c.id,c.targetSceneId]),[
    ['eric','s18-intro'],['nick','s19-intro'],['damir','s20-intro'],['self','s21-intro'],
  ]);
  assert.equal(scene('s21-m3-end'),undefined);
  assert.equal(scene('s21-intro').nextSceneId,'s21-choice-note');
  const letter=choice('s21-choice-note','s21-letter-choice');
  assert.deepEqual(letter.choices.map(c=>[c.id,c.targetSceneId,c.effects]),[
    ['people','s21-people',[{op:'flag_set',id:'alice-letter-people',value:true}]],
    ['place','s21-place',[{op:'flag_set',id:'alice-letter-place',value:true}]],
    ['own','s21-own',[{op:'flag_set',id:'alice-letter-own',value:true}]],
  ]);
  for(const id of ['people','place','own'])assert.equal(scene('s21-'+id).nextSceneId,'s21-common');
  assert.equal(scene('s21-common').nextSceneId,'s21-reply-dispatch');
  const reply=choice('s21-reply-dispatch','s21-reply-choice');
  assert.deepEqual(reply.choices.map(c=>[c.id,c.targetSceneId,c.when?.flag,c.effects]),[
    ['a','s21-m-a','alice-letter-people',undefined],
    ['b','s21-m-b','alice-letter-place',undefined],
    ['c','s21-m-c','alice-letter-own',undefined],
  ]);
  for(const id of ['a','b','c'])assert.equal(scene('s21-m-'+id).nextSceneId,'s21-followup-choice-scene');
  const c2=choice('s21-followup-choice-scene','s21-followup-choice');
  assert.deepEqual(c2.choices.map(c=>[c.id,c.targetSceneId,c.effects]),[
    ['friend','s21-friend',[{op:'flag_set',id:'alice-self-friend',value:true}]],
    ['bookstore','s21-bookstore',[{op:'flag_set',id:'alice-self-bookstore',value:true}]],
  ]);
  for(const id of ['friend','bookstore'])
    assert.equal(scene('s21-'+id).nextSceneId,'s61-intro','S61 mandatory '+id);
  assert.equal(scene('s61-intro').nextSceneId,'s61-editor-dispatch');
  const r=choice('s61-editor-dispatch','s61-editor-choice');
  assert.deepEqual(r.choices.map(c=>[c.id,c.targetSceneId,c.when?.flag,c.effects]),[
    ['a','s61-r-a','alice-letter-people',undefined],
    ['b','s61-r-b','alice-letter-place',undefined],
    ['c','s61-r-c','alice-letter-own',undefined],
  ]);
  for(const id of ['a','b','c'])assert.equal(scene('s61-r-'+id).nextSceneId,'s61-common-a');
  const day=choice('s61-common-a','s61-day-choice');
  assert.deepEqual(day.choices.map(c=>[c.id,c.targetSceneId,c.effects]),[
    ['alone-longer','s61-stay-alone',[{op:'flag_set',id:'alice-day-alone-longer',value:true}]],
    ['return-to-group','s61-rejoin',[{op:'flag_set',id:'alice-day-return-to-group',value:true}]],
  ]);
  assert.equal(scene('s61-stay-alone').nextSceneId,'s61-common-b');
  assert.equal(scene('s61-rejoin').nextSceneId,'s61-common-b');
  assert.equal(scene('s61-common-b').nextSceneId,'s61-followup-dispatch');
  const f=choice('s61-followup-dispatch','s61-followup-payoff-choice');
  assert.deepEqual(f.choices.map(c=>[c.id,c.targetSceneId,c.when?.flag,c.effects]),[
    ['friend','s61-friend','alice-self-friend',undefined],
    ['bookstore','s61-bookstore','alice-self-bookstore',undefined],
  ]);
  for(const id of ['friend','bookstore'])
    assert.equal(scene('s61-'+id).nextSceneId,'s61-after-m3-end');
  assert.equal(scene('s61-after-m3-end').beats[0].type,'ending');
  assert.equal(scene('s61-m3-end'),undefined);
  for(const c of [...letter.choices,...reply.choices,...c2.choices,...r.choices,...day.choices,...f.choices])
    for(const disallowed of ['cost','premium','routeLock','routeIntent','romancePoints',
      'consentToPublish','publishPermission','requiredEntitlement','mediaPermission'])
      assert.equal(c[disallowed],undefined,disallowed);
});

const priorRoute={
  's01-seat-choice':'front-eric','s02-career-choice':'people',
  's03-career-dispatch':'people','s03-seat-dispatch':'other',
  's03-after-pharmacy-choice':'silence','s04-camera-consent-choice':'declined',
  's04-s03-dispatch':'silence','s05-weather-choice':'damir',
  's06-weather-dispatch':'other','s06-seat-dispatch':'eric',
  's06-eric-choice':'music','s07-weather-dispatch':'other',
  's07-seat-dispatch':'other','s07-consent-dispatch':'declined',
  's07-archive-choice':'private','s07-s06-dispatch':'music',
  's08-weather-dispatch':'damir','s08-damir-care-choice':'warm',
  's66-damir-dispatch':'warm','s66-career-dispatch':'people',
  's09-voice-choice':'damir','s09-career-dispatch':'people',
  's10-seat-dispatch':'eric','s10-tone-choice':'quiet',
  's11-consent-dispatch':'declined','s11-safety-choice':'a',
  's12-care-dispatch':'warm','s12-voice-dispatch':'damir',
  's12-past-choice':'listen','s12-draft-choice':'private',
  's12-return-choice':'chocolate','s13-voice-dispatch':'damir',
  's13-work-choice':'shared','s13-return-dispatch':'chocolate',
  's14-tone-dispatch':'quiet','s14-pace-choice':'slow',
  's14-gesture-choice':'walk','s15-voice-dispatch':'damir',
  's15-privacy-choice':'c','s15-gesture-dispatch':'walk',
  's16-care-choice':'a','s17-n-dispatch':'c','s17-e-dispatch':'b',
  's17-d-dispatch':'a','s17-group-choice':'d','s17-evening-choice':'self',
};

function runtime(snapshot){
  const graph=defineNarrativeGraph(graphData),catalog=defineNarrativeCatalog(catalogData);
  const update=createNarrativeRuntimeUpdate({graph,catalog});
  let state={narrative:JSON.parse(JSON.stringify(snapshot??createNarrativeState(graph)))};
  const act=action=>update({deltaMs:16,state,inputs:[{schemaVersion:1,type:'pointer',
    action,phase:'up',timestamp:181,source:'renderer'}],setState(s){state=s;}});
  const advance=id=>{
    assert.equal(state.narrative.sceneId,id);
    for(const b of scene(id).beats.filter(x=>x.type==='dialogue'))
      act('narrative:next:'+b.id);
  };
  return {graph,catalog,act,advance,get:()=>state.narrative};
}
function reachS21(){
  const run=runtime();
  for(let i=0;i<5000 && run.get().sceneId!=='s21-intro';i++){
    const {sceneId,beatIndex}=run.get();
    const beat=scene(sceneId)?.beats[beatIndex],before=sceneId+':'+beatIndex;
    assert.ok(beat,before);
    if(beat.type==='dialogue')run.act('narrative:next:'+beat.id);
    else if(beat.type==='choice'){
      assert.ok(priorRoute[beat.id],'unmapped choice '+beat.id);
      run.act('narrative:choose:'+beat.id+':'+priorRoute[beat.id]);
    }else assert.fail('premature ending '+sceneId);
    assert.notEqual(run.get().sceneId+':'+run.get().beatIndex,before,'stalled '+before);
  }
  assert.equal(run.get().sceneId,'s21-intro');
  return run;
}

test('real N1: all 3×2×2 S21/S61 combinations, Back, new-runtime JSON and privacy',()=>{
  const base=reachS21();
  assert.equal(base.get().flags['s17-evening-self'],true);
  assert.equal(base.get().flags['private-text-pending'],true);
  base.advance('s21-intro');
  base.advance('s21-choice-note');
  const checkpoint=JSON.parse(JSON.stringify(base.get()));
  const emails={people:['s21-people','alice-letter-people','a'],
    place:['s21-place','alice-letter-place','b'],
    own:['s21-own','alice-letter-own','c']};
  for(const [email,[branch,flag,callback]] of Object.entries(emails))
    for(const self of ['friend','bookstore'])
      for(const day of ['alone-longer','return-to-group']){
        const run=runtime(checkpoint);
        const initial=JSON.stringify(run.get());
        run.act('narrative:choose:s21-letter-choice:invalid');
        assert.equal(JSON.stringify(run.get()),initial);
        run.act('narrative:choose:s21-letter-choice:'+email);
        assert.equal(run.get().sceneId,branch);
        assert.equal(run.get().flags[flag],true);
        assert.equal(run.get().routeLock,null);
        run.act('narrative:back');
        assert.equal(JSON.stringify(run.get()),initial);
        run.act('narrative:choose:s21-letter-choice:'+email);
        const s21=runtime(JSON.parse(JSON.stringify(run.get())));
        s21.advance(branch);
        s21.advance('s21-common');
        assert.equal(s21.get().sceneId,'s21-reply-dispatch');
        for(const wrong of ['a','b','c'].filter(x=>x!==callback)){
          const before=JSON.stringify(s21.get());
          s21.act('narrative:choose:s21-reply-choice:'+wrong);
          assert.equal(JSON.stringify(s21.get()),before);
        }
        s21.act('narrative:choose:s21-reply-choice:'+callback);
        s21.advance('s21-m-'+callback);
        assert.equal(s21.get().sceneId,'s21-followup-choice-scene');
        const beforeFollow=JSON.stringify(s21.get());
        s21.act('narrative:choose:s21-followup-choice:'+self);
        assert.equal(s21.get().flags['alice-self-'+self],true);
        s21.act('narrative:back');
        assert.equal(JSON.stringify(s21.get()),beforeFollow);
        s21.act('narrative:choose:s21-followup-choice:'+self);
        s21.advance('s21-'+self);
        assert.equal(s21.get().sceneId,'s61-intro');
        const s61=runtime(JSON.parse(JSON.stringify(s21.get())));
        s61.advance('s61-intro');
        assert.equal(s61.get().sceneId,'s61-editor-dispatch');
        for(const wrong of ['a','b','c'].filter(x=>x!==callback)){
          const before=JSON.stringify(s61.get());
          s61.act('narrative:choose:s61-editor-choice:'+wrong);
          assert.equal(JSON.stringify(s61.get()),before);
        }
        s61.act('narrative:choose:s61-editor-choice:'+callback);
        s61.advance('s61-r-'+callback);
        s61.advance('s61-common-a');
        assert.equal(s61.get().sceneId,'s61-common-a');
        const beforeDay=JSON.stringify(s61.get());
        s61.act('narrative:choose:s61-day-choice:'+day);
        assert.equal(s61.get().flags['alice-day-'+day],true);
        s61.act('narrative:back');
        assert.equal(JSON.stringify(s61.get()),beforeDay);
        s61.act('narrative:choose:s61-day-choice:'+day);
        s61.advance('s61-'+(day==='alone-longer'?'stay-alone':'rejoin'));
        s61.advance('s61-common-b');
        assert.equal(s61.get().sceneId,'s61-followup-dispatch');
        for(const wrong of ['friend','bookstore'].filter(x=>x!==self)){
          const before=JSON.stringify(s61.get());
          s61.act('narrative:choose:s61-followup-payoff-choice:'+wrong);
          assert.equal(JSON.stringify(s61.get()),before);
        }
        s61.act('narrative:choose:s61-followup-payoff-choice:'+self);
        s61.advance('s61-'+self);
        assert.equal(s61.get().sceneId,'s61-after-m3-end');
        assert.equal(s61.get().flags['private-text-pending'],true);
        assert.equal(s61.get().flags['nick-joint-file-approved'],undefined);
        assert.equal(s61.get().flags['editor-publish-approved'],undefined);
        assert.equal(s61.get().flags['s17-evening-self'],true);
        assert.equal(s61.get().routeLock,null);
      }
});

test('N1 rejects forged sent-letter flags/actionLog without mutations',()=>{
  const run=reachS21();
  run.advance('s21-intro');
  run.advance('s21-choice-note');
  run.act('narrative:choose:s21-letter-choice:people');
  const saved=JSON.parse(JSON.stringify(run.get()));
  const forged=[
    {...saved,flags:{...saved.flags,'alice-letter-own':true}},
    {...saved,flags:Object.fromEntries(Object.entries(saved.flags).filter(([k])=>k!=='alice-letter-people'))},
    {...saved,actionLog:saved.actionLog.map(entry=>
      entry.type==='choose'&&entry.beatId==='s21-letter-choice'
        ?{...entry,optionId:'own'}:entry)},
    {...saved,actionLog:saved.actionLog.slice(0,-1)},
  ];
  for(const invalid of forged){
    const before=JSON.stringify(invalid);
    let writes=0;
    assert.throws(()=>createNarrativeRuntimeUpdate({graph:run.graph,catalog:run.catalog})({
      deltaMs:16,state:{narrative:invalid},inputs:[{schemaVersion:1,type:'pointer',
        action:'narrative:next:'+scene('s21-people').beats[0].id,
        phase:'up',timestamp:182,source:'renderer'}],
      setState(){writes++;},
    }),/inconsistent actionLog provenance or position|unavailable choice/);
    assert.equal(writes,0);
    assert.equal(JSON.stringify(invalid),before);
  }
  assert.equal(run.get().flags['alice-letter-people'],true);
  assert.equal(run.get().flags['private-text-pending'],true);
});

test('N1 rejects forged S61-C1 day flags and choice provenance without state writes',()=>{
  const run=reachS21();
  run.advance('s21-intro');
  run.advance('s21-choice-note');
  run.act('narrative:choose:s21-letter-choice:people');
  run.advance('s21-people');
  run.advance('s21-common');
  run.act('narrative:choose:s21-reply-choice:a');
  run.advance('s21-m-a');
  run.act('narrative:choose:s21-followup-choice:friend');
  run.advance('s21-friend');
  run.advance('s61-intro');
  run.act('narrative:choose:s61-editor-choice:a');
  run.advance('s61-r-a');
  run.advance('s61-common-a');
  run.act('narrative:choose:s61-day-choice:alone-longer');
  const saved=JSON.parse(JSON.stringify(run.get()));
  const forged=[
    {...saved,flags:{...saved.flags,'alice-day-return-to-group':true}},
    {...saved,flags:Object.fromEntries(Object.entries(saved.flags)
      .filter(([k])=>k!=='alice-day-alone-longer'))},
    {...saved,actionLog:saved.actionLog.map(entry=>
      entry.type==='choose'&&entry.beatId==='s61-day-choice'
        ?{...entry,optionId:'return-to-group'}:entry)},
    {...saved,actionLog:saved.actionLog.slice(0,-1)},
  ];
  for(const invalid of forged){
    const before=JSON.stringify(invalid);
    let writes=0;
    assert.throws(()=>createNarrativeRuntimeUpdate({graph:run.graph,catalog:run.catalog})({
      deltaMs:16,state:{narrative:invalid},inputs:[{schemaVersion:1,type:'pointer',
        action:'narrative:next:'+scene('s61-stay-alone').beats[0].id,
        phase:'up',timestamp:183,source:'renderer'}],
      setState(){writes++;},
    }),/inconsistent actionLog provenance or position|unavailable choice/);
    assert.equal(writes,0);
    assert.equal(JSON.stringify(invalid),before);
  }
  assert.equal(run.get().flags['alice-day-alone-longer'],true);
  assert.equal(run.get().flags['private-text-pending'],true);
});

test('independent route has no currency, premium or IAP and no relationship lock',()=>{
  assert.equal(existsSync(new URL('../game/config/economy.json',import.meta.url)),false);
  assert.equal(existsSync(new URL('../game/config/premium.json',import.meta.url)),false);
  assert.deepEqual(catalogData.interactions,[]);
});
