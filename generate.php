<?php

namespace Mogul\Jobs;

use App\Jobs\Job;
use Illuminate\Contracts\Bus\SelfHandling;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Mogul\Models\EVEItem;
use Carbon\Carbon;
use Sentinel;
use DB;
use \Cache;
use RunningStat\RunningStat;

class GenerateCrestIndex extends Job implements SelfHandling
{
    use DispatchesJobs;
    public $typeids;
    public $dataarray;
    public $indexName;


    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($typeids = [], $indexName = "Index", $regionid = null)
    {
        $this->typeids = $typeids;
        $this->user = \Sentinel::getUser();
        $this->dataarray = [];
        $this->indexName = $indexName;

    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        if(isset($data['regionID']))
        {
          $region = intval($data['regionID']);
        } else {
            if($this->user)
            {
                $region = @$this->user->getPreference($this->user, 'userHub')->pivot->pivot_data;  
            } else {
                $region = 10000002;
            }
        }
        if(!$region)
        {
          $region = 10000002;
        }
        if(\App::runningInConsole())
        {
            Cache::forget($region.'index_'. serialize($this->typeids));
            $minutes = 360;
        } else {
            $minutes = 15;
        }

        if(Cache::has($region.'index_'. serialize($this->typeids)))
        {
            return Cache::get($region.'index_'. serialize($this->typeids));
        }
        // Get all the crest data first
        foreach($this->typeids as $id)
        {
            $itemrow = EVEItem::where('typeID', '=', $id)->first();
            if(!$itemrow)
            {
                event(new \Mogul\Events\ItemNotFound($id));
            }
            $itemrow = EVEItem::where('typeID', '=', $id)->first();
            if($itemrow->published == 1)
            {
                $this->retrieveCrest($itemrow);
            }
        }
        $index = $this->createIndex();
        Cache::put($region.'index_'. serialize($this->typeids), $index, $minutes);
        return $index;
    }

    public function retrieveCrest($itemrow)
    {
        if(isset($data['regionID']))
        {
          $region = intval($data['regionID']);
        } else {
            if($this->user)
            {
                $region = @$this->user->getPreference($this->user, 'userHub')->pivot->pivot_data;  
            } else {
                $region = 10000002;
            }
        }
        if(!$region)
        {
          $region = 10000002;
        }
        $arguments = ['market', $region , 'types', $itemrow->typeID, 'history'];
        $removedate = array('T00:00:00');
        $data = $this->dispatch(new \Mogul\Jobs\GetCCPCrest($arguments));
        $avg = [];
        if(isset($data->items))
        {
            foreach($data->items as $item)
            {
              $time = str_replace($removedate, '', $item->date);
              $dataTime = Carbon::parse($time);
              $diffTime = Carbon::createFromTimestamp(0)->diffInMinutes($dataTime) * 60 * 1000;
              if(array_key_exists($diffTime, $this->dataarray))
              {
                // We need to append
                $this->dataarray[$diffTime]['totalVolume'] += $item->volume;
                $this->dataarray[$diffTime]['avg'] = ($this->dataarray[$diffTime]['avg'] + $item->avgPrice) / 2;
                $this->dataarray[$diffTime]['items'][] =  array(
                    'avg' => $item->avgPrice,
                    'volume' => $item->volume
                    );
              } else {
                $this->dataarray[$diffTime]['items'] = array();
                $this->dataarray[$diffTime]['avg'] = $item->avgPrice;
                $this->dataarray[$diffTime]['totalVolume'] = $item->volume;
                $this->dataarray[$diffTime]['items'][] =  array(
                    'avg' => $item->avgPrice,
                    'volume' => $item->volume
                    );
              }
            }
        }
        

    }

    public function createIndex()
    {
        $volumearray = [];
        $avgarray = [];
        $indexAvg = null;
        
        ksort($this->dataarray);
        $weekarray = [];
        foreach($this->dataarray as $index => $row)
        {
            $weighted = 0;
            foreach($row['items'] as $item)
            {
                $perc = $item['volume'] / $row['totalVolume'];
                $weighted += floatval($perc * $item['avg']);
            }
            if($weighted == 0)
            {
                continue;
            }
            $weekarray[] = $weighted;
            if(count($weekarray) > 7)
            {
                
                array_shift($weekarray);
            }
            unset($rstat);
            $rstat = new RunningStat();
            foreach($weekarray as $item)
            {
                $rstat->addObservation($item);
            }
            $devlow = $rstat->getMean() + $rstat->getStdDev();
            $devhigh = $rstat->getMean() + $rstat->getStdDev();
            if($weighted <= ($devhigh * 1.1) && $weighted >= ($devlow * .50))
            {
                $rstat->addObservation($weighted);
                $avgarray[] = array($index, $weighted);
            }
            $volumearray[] = array($index, $row['totalVolume']);  
        }
        $series[] = array(
                    'name' => $this->indexName . " Volume",
                    'data' => $volumearray,
                    'yAxis' => 1,
                    'type' => 'column'
                    );
        $series[] = array(
                    'name' => $this->indexName . " Index",
                    'data' => $avgarray,
                    'overallavg' => $indexAvg,
                    'yAxis' => 0,
                    'type' => 'line'
                    );

        return $series;

    }

}

