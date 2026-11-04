import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { graphData, catalogData } from '../game/src/story.js';
import {
  defineNarrativeGraph, defineNarrativeCatalog, createNarrativeState, createNarrativeRuntimeUpdate,
} from '../game/assets/ludory-narrative.js';

// Paragraph counts and hashes derived from pinned EP03/S10 source rather than game code.
const proof={
  's10-intro':[37,'e9d348cda4dd13ba9d349c907cd0e8179789f1605fc00ecb84da5ac3bdbb45d8'],
  's10-seat-eric':[4,'2b2aa8e0ec19ea74dfc5ef5ca54d09d34a0ad7498a20fe9f682ad043ada45d19'],
  's10-seat-other':[3,'8ba0c85d06f999c4d36acb5f8d135561dc939fcecd4a9dde32609583ff1999f2'],
  's10-playful':[5,'633812b5a1754d6c56ddfe26d22d105098335ba279d6b45dadec2094cf4cde53'],
  's10-quiet':[2,'5e93562a95c3532854991c64b8fbb5deb4a8a672992ea7ce00951ac4d4a72929'],
  's10-common':[1,'1b5c889dfbd25901024b0358304391af00e023256adfda88c112862b3dcb3ad5'],
};
const scene=id=>graphData.scenes.find(x=>x.id===id);
const paragraphs=id=>(scene(id)?.beats||[]).filter(x=>x.type==='dialogue').map(x=>x.text.ru);

test('S10 six canonical blocks match pinned EP03 manuscript exactly',()=>{
  for(const [id,[count,hash]]of Object.entries(proof)){
    const p=paragraphs(id);
    assert.equal(p.length,count,`${id}: paragraph count`);
    assert.equal(createHash('sha256').update(p.join('\n\n')).digest('hex'),hash,id);
  }
  assert.doesNotThrow(()=>defineNarrativeGraph(graphData));
});

test('S09 leads to S10; S01 callback is guarded and S10-C1 is one free authored 2-way choice',()=>{
  assert.equal(scene('s09-common-b').nextSceneId,'s10-intro');
  assert.equal(scene('s09-m3-end'),undefined);
  const seat=scene('s10-intro').beats.at(-1);
  assert.equal(seat.id,'s10-seat-dispatch');
  assert.deepEqual(seat.choices.map(({id,targetSceneId,when})=>[id,targetSceneId,when]),[
    ['eric','s10-seat-eric',{flag:'s01-seat-eric'}],
    ['other','s10-seat-other',{any:[{flag:'s01-seat-nick'},{flag:'s01-seat-damir'}]}],
  ]);
  assert.ok(seat.choices.every(x=>x.label.ru==='Продолжить'&&!x.effects));
  for(const id of ['eric','other']) assert.equal(scene('s10-seat-'+id).nextSceneId,'s10-choice');
  const tone=scene('s10-choice').beats[0];
  assert.equal(tone.id,'s10-tone-choice');
  assert.deepEqual(tone.choices.map(({id,label,targetSceneId,effects})=>[id,label.ru,targetSceneId,effects]),[
    ['playful','Подхватить игру','s10-playful',[{op:'flag_set',id:'eric-tone-playful',value:true}]],
    ['quiet','Оставить момент тихим','s10-quiet',[{op:'flag_set',id:'eric-tone-quiet',value:true}]],
  ]);
  for(const id of ['playful','quiet'])assert.equal(scene('s10-'+id).nextSceneId,'s10-common');
  assert.equal(scene('s10-common').nextSceneId,'s11-intro');
  assert.equal(scene('s10-m3-end'),undefined);
  for(const choice of [...seat.choices,...tone.choices])for(const field of ['cost','premium','contentId','requiredEntitlement'])assert.equal(choice[field],undefined);
});

function runToS10(seat){
  const graph=defineNarrativeGraph(graphData),catalog=defineNarrativeCatalog(catalogData);
  const update=createNarrativeRuntimeUpdate({graph,catalog});
  let state={narrative:createNarrativeState(graph)};
  const act=action=>update({deltaMs:16,state,inputs:[{schemaVersion:1,type:'pointer',action,phase:'up',timestamp:101,source:'renderer'}],setState(x){state=x;}});
  const seatChoice={eric:'front-eric',nick:'back-nick',damir:'back-damir'};
  const route={
    's01-seat-choice':seatChoice[seat], 's02-career-choice':'people',
    's03-career-dispatch':'people','s03-seat-dispatch':seat==='damir'?'damir':'other',
    's03-after-pharmacy-choice':'silence','s04-camera-consent-choice':'declined',
    's04-s03-dispatch':'silence','s05-weather-choice':'damir',
    's06-weather-dispatch':'other','s06-seat-dispatch':seat==='eric'?'eric':'other',
    's06-eric-choice':'music','s07-weather-dispatch':'other',
    's07-seat-dispatch':seat==='nick'?'nick':'other','s07-consent-dispatch':'declined',
    's07-archive-choice':'private','s07-s06-dispatch':'music',
    's08-weather-dispatch':'damir','s08-damir-care-choice':'warm',
    's66-damir-dispatch':'warm','s66-career-dispatch':'people',
    's09-voice-choice':'nick','s09-career-dispatch':'people',
  };
  for(let i=0;i<3000&&state.narrative.sceneId!=='s10-intro';i++){
    const {sceneId,beatIndex}=state.narrative;
    const beat=scene(sceneId)?.beats[beatIndex];
    assert.ok(beat,`${sceneId}:${beatIndex}`);
    if(beat.type==='dialogue')act('narrative:next:'+beat.id);
    else if(beat.type==='choice'){
      const answer=route[beat.id];assert.ok(answer,'unmapped '+beat.id);
      act('narrative:choose:'+beat.id+':'+answer);
    }else assert.fail('early ending '+sceneId);
  }
  assert.equal(state.narrative.sceneId,'s10-intro');
  const advance=id=>{
    assert.equal(state.narrative.sceneId,id);
    for(const beat of scene(id).beats.filter(x=>x.type==='dialogue'))act('narrative:next:'+beat.id);
  };
  return {act,advance,get:()=>state.narrative,set(s){state={narrative:JSON.parse(JSON.stringify(s))};},graph,catalog};
}

test('S01 Eric/Nick/Damir each have correct S10 callback; both tones Back-reverse and JSON-resume',()=>{
  for(const seat of ['eric','nick','damir']){
    const run=runToS10(seat);
    run.advance('s10-intro');
    const chosen=seat==='eric'?'eric':'other';
    const before=JSON.stringify(run.get());
    run.act('narrative:choose:s10-seat-dispatch:'+(chosen==='eric'?'other':'eric'));
    assert.equal(JSON.stringify(run.get()),before,'wrong S01 callback must be unavailable');
    run.act('narrative:choose:s10-seat-dispatch:'+chosen);
    assert.equal(run.get().sceneId,'s10-seat-'+chosen);
    assert.equal(run.get().flags['s01-seat-'+seat],true);
    run.advance('s10-seat-'+chosen);
    assert.equal(run.get().sceneId,'s10-choice');
    const checkpoint=JSON.parse(JSON.stringify(run.get()));
    for(const tone of ['playful','quiet']){
      run.set(checkpoint);
      run.act('narrative:choose:s10-tone-choice:'+tone);
      assert.equal(run.get().sceneId,'s10-'+tone);
      assert.deepEqual(Object.keys(run.get().flags).filter(x=>x.startsWith('eric-tone-')),['eric-tone-'+tone]);
      assert.equal(run.get().flags['s01-seat-'+seat],true);
      assert.equal(run.get().flags['skogafoss-voice-nick'],true);
      assert.equal(run.get().routeLock,null);
      const saved=JSON.parse(JSON.stringify(run.get()));
      const fresh=createNarrativeRuntimeUpdate({graph:run.graph,catalog:run.catalog});
      let restored={narrative:JSON.parse(JSON.stringify(saved))};
      fresh({deltaMs:16,state:restored,inputs:[{schemaVersion:1,type:'pointer',action:'narrative:next:s10-'+tone+'-01',phase:'up',timestamp:102,source:'renderer'}],setState(x){restored=x;}});
      assert.equal(restored.narrative.flags['eric-tone-'+tone],true);
      assert.equal(restored.narrative.flags['s01-seat-'+seat],true);
      assert.equal(restored.narrative.beatIndex,1);
      const corrupt=JSON.parse(JSON.stringify(saved));corrupt.flags['eric-tone-'+(tone==='playful'?'quiet':'playful')]=true;
      assert.throws(()=>fresh({deltaMs:16,state:{narrative:corrupt},inputs:[{schemaVersion:1,type:'pointer',action:'narrative:next:s10-'+tone+'-01',phase:'up',timestamp:103,source:'renderer'}],setState(){}}),/inconsistent actionLog provenance or position/);
      const missing=JSON.parse(JSON.stringify(saved));delete missing.flags['eric-tone-'+tone];
      assert.throws(()=>fresh({deltaMs:16,state:{narrative:missing},inputs:[{schemaVersion:1,type:'pointer',action:'narrative:next:s10-'+tone+'-01',phase:'up',timestamp:104,source:'renderer'}],setState(){}}),/inconsistent actionLog provenance or position/);
      run.act('narrative:back');
      assert.equal(run.get().sceneId,'s10-choice');
      assert.equal(run.get().flags['eric-tone-'+tone],undefined);
      assert.equal(run.get().flags['s01-seat-'+seat],true);
      assert.equal(run.get().flags['skogafoss-voice-nick'],true);
      const otherTone=tone==='playful'?'quiet':'playful';
      run.act('narrative:choose:s10-tone-choice:'+otherTone);
      assert.equal(run.get().flags['eric-tone-'+otherTone],true);
      run.act('narrative:back');
      assert.equal(run.get().flags['eric-tone-'+otherTone],undefined);
      run.act('narrative:choose:s10-tone-choice:'+tone);
      run.advance('s10-'+tone);
      run.advance('s10-common');
      assert.equal(run.get().sceneId,'s11-intro');
    }
  }
});

test('Economy E5 stays disabled throughout the first novel S10',()=>{
  assert.equal(existsSync(new URL('../game/config/economy.json',import.meta.url)),false);
  assert.equal(existsSync(new URL('../game/config/premium.json',import.meta.url)),false);
  assert.deepEqual(catalogData.interactions,[]);
});
