@extends('layouts/public')
{{-- Page title --}}
@section('title')
Help ::
@parent
@stop

{{-- Queue Assets --}}
{{ Asset::queue('preferences', 'vue/crestindex.js') }}

{{-- Inline Scripts --}}
@section('scripts')
@parent
<script src="https://cdnjs.cloudflare.com/ajax/libs/marked/0.3.5/marked.js"></script>
<script>
$('.checkbox')
  .checkbox()
;
</script>
@stop

{{-- Page content --}}
@section('page')
<div id="vue" class="page">
  <div class="ui inverted padded grid stackable">
    <div class="ui sixteen wide column padded segment">
      {{-- Form --}}
      <h3 class="ui horizontal divider header">Crest Indexes</h3>
      <center><span class="ui small button" @click="clearSeries()">Reset Graph</span></center><br>
      <div class="ui two column equal width grid">
      <div class="column">
      <div id="crestgraph" style="min-width: 310px; height: 400px;"></div>
      <a class="ui small button" @click="getMinerals()">Mineral Index</a>
      <a class="ui small button" @click="getPI()">P1/P2 Planetary</a>
      <a class="ui small button" @click="getPItwo()">P3/P4 Planetary</a>
      <a class="ui small button" @click="getIce()">Ice Product Index</a>
      <a class="ui small button" @click="getConstructionComponents()">Construction Components</a>
      <a class="ui small button" @click="getCapitalComponents()">Capital Components</a>
      <a class="ui small button" @click="getTech3()">T3 Components</a>
      <a class="ui small button" @click="getMoonMaterials()">Moon Materials</a>
      <a class="ui small button" @click="getSalvage()">T1 Salvage</a>
      <a class="ui small button" @click="getT2Salvage()">T2 Salvage</a>
      <a class="ui small button" @click="getSleeperSalvage()">Sleeper Salvage</a>
      <a class="ui small button" @click="getIRL()">Plex/Aur/MTC/Skill Index</a>
      <a class="ui small button" @click="getDeadspaceMods()">Deadspace Mods</a>
    </div>

  </div>
  </span></center></div>
@stop
