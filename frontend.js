var CrestIndex = Vue.extend({
    http: {
        root: '/root',
        headers: {
          'X-CSRF-TOKEN': $("meta[name=csrf-token]").attr("content"),
          'Authorization': 'Bearer ' + $("meta[name=jwt]").attr("content")
        }
      },
    template: '#crest-index-template',

    data: function()
    {
        return {
            chartData: [],
            chartLabels: [],
            myLineChart: null,
            typeIDs: []
        }
    },
    events:
    {
        graphUpdated: function() {
            this.refreshGraph();
        }
    },
    methods: {
        createGraph: function()
        {
            Highcharts.setOptions({lang: {noData: "Your custom message"}});
            $('#crestgraph').highcharts({
                credits: {
                enabled: false,
            },
            chart: {
                type: 'spline',
                zoomType: 'x'
            },
            lang: {
                noData: "Add some items to compare prices"
            },
            noData: {
                style: {
                    fontWeight: 'bold',
                    fontSize: '15px',
                    color: '#303030'
                }
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: { // don't display the dummy year
                    month: '%e. %b',
                    year: '%b'
                },
                title: {
                    text: 'Date'
                }
            },
            yAxis: [{ // Primary yAxis
                title: {
                    text: 'Index',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                

            },{
                gridLineWidth: 0,
                title: {
                    text: 'Volume',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                opposite: true
            }],
            title: {
                text: '',
            },
            legend: {
                enabled: true
            },
            tooltip: {
                    formatter: function() {
                        var s = [];
                        s.push('<b>' + moment(this.x).format('YYYY-MM-DD') + '</b><br>');
                        $.each(this.points, function(i, point) {
                            
                            s.push('<span><b>'+ point.series.name +'</b> : '+
                                $.number(point.y,2) +'<span><br>');
                        });

                        return s.join('');
                    },
                    shared: true
                },
            plotOptions: {
                spline: {
                    marker: {
                        enabled: true
                    }
                }
            },
            series: []
            });
        },
        addSeries: function(typeIDs, slug) {
            var resource = this.$resource('/api/hangar/crestindex/');
            //this.$dispatch('loadingStart');
            resource.get({typeIDs: typeIDs, 'indexName': slug}, function (data, status, request) {
                dataarray = JSON.stringify(data);
                dataarray = JSON.parse(dataarray);
                $.each(dataarray, function(i, series) {
                    var chart = $('#crestgraph').highcharts();
                    chart.addSeries(series);
                });
                this.$dispatch('loadingStop');
            }).error(function (data, status, request) {
                // handle error
                this.fetching = false;
                console.log(data);
                toastr.error("Error fetching CREST");
                this.$dispatch('loadingStop');
            });
        },
        clearSeries: function()
        {
            var chart = $('#crestgraph').highcharts();
            while(chart.series.length > 0)
            chart.series[0].remove(true);
            chart.zoom();
        },
        getMinerals: function()
        {
            arr = [34,35,36,37,38,39,40,11399];
            this.addSeries(arr, 'Mineral');
        },
        getIRL: function()
        {
            arr = [40519,40520,2833,32792,32793, 29668];
            this.addSeries(arr, 'Plex/Aur/MTC/Skill');
        },
        getPI: function()
        {
            arr = [2393, 2396, 3779, 2401, 2390, 2397, 2392, 3683, 2389, 2399, 2395, 2398, 9828, 2400, 3645, 2351, 2349, 2346, 12836, 17136, 28974, 2329, 3828, 9836, 9832, 44, 3693, 15317, 3725, 3689, 2327, 9842, 2463, 2317, 2321, 3695, 9830, 3697, 9838, 2312, 3691, 2319, 9840, 3775, 2328];
            this.addSeries(arr, 'PI 1/2');
        },getPItwo: function()
        {
            arr = [2358, 2345, 2344, 2367, 17392, 2348, 9834, 2366, 2361, 17898, 2360, 2354, 2352, 9846, 9848, 2351, 2349, 2346, 12836, 17136, 28974, 2867, 2868, 2869, 2870, 2871, 2872, 2875, 2876];
            this.addSeries(arr, 'PI 3/4');
        },getIce: function()
        {
            arr = [16272, 16274, 17889, 16273, 17888, 17887, 16275]
            this.addSeries(arr, 'Ice Product');
        },getConstructionComponents: function()
        {
            arr = [11543, 11544, 11691, 11554, 11558, 11690, 33195, 11552, 11537, 11540, 11556, 11530, 11695, 11541, 11688, 11553, 11548, 11692, 11538, 11539, 11533, 11535, 11557, 11689, 11536, 11531, 11550, 11693, 11534, 11532, 11547, 11542, 11551, 11694, 11555, 11545, 11549]
            this.addSeries(arr, 'Construction Components');
        },getCapitalComponents: function()
        {
            arr = [29109, 29107, 29105, 29103, 29101, 29099, 29097, 29095, 29093, 29091, 29089, 29087, 29085, 29083, 29081, 29079, 29077, 29075, 29073, 29071, 29069, 29067, 29063, 29065, 29061, 29059, 29057, 29055, 29053, 29051, 29049, 29045, 29047, 29043, 29041, 29039, 21011, 21039, 24558, 21023, 21013, 21009, 21021, 21041, 21025, 24545, 21029, 24556, 24560, 21037, 21035, 24547, 21027, 21019, 21017]
            this.addSeries(arr, 'Capital Components');
        },getMoonMaterials: function()
        {
            arr = [16634, 16643, 16647, 16641, 16640, 16650, 16635, 16648, 16633, 16646, 16651, 16644, 16652, 16639, 16636, 16649, 16653, 16638, 16637, 16642]
            this.addSeries(arr, 'Moon Metrials');
        },getSalvage: function()
        {
            arr = [25588,25589,25590,25591,25592,25593,25594,25595,25596, 25597,25598,25599,25600,25601,25602,25603]
            this.addSeries(arr, 'T1 Salvage');
        },getT2Salvage: function()
        {
            arr = [25616, 25622, 25611, 25615, 25625, 25621, 25620, 25619, 25609, 25617, 25613, 25614, 25607, 25612]
            this.addSeries(arr, 'T2 Salvage');
        },getSleeperSalvage: function()
        {
            arr = [30024, 30270, 30269, 30254, 30248, 30271, 30018, 30022, 30268, 30259, 30021, 30251, 30019, 30258, 30252]
            this.addSeries(arr, 'Sleeper Salvage');
        },getT2Ships: function()
        {
            arr = [22436, 22430, 22428, 22440, 12743, 12735, 12733, 12729, 11959, 11971, 11961, 20125, 37482, 37481, 37483, 37480, 22446, 22444, 22470, 22442, 22474, 22468, 22466, 22448, 11172, 11182, 11192, 11188, 12745, 12747, 12753, 12731, 11190, 11194, 11174, 11387, 22546, 22548, 22544, 11963, 11965, 11957, 11969, 12003, 11999, 12019, 12015, 12005, 12011, 12023, 11993, 12021, 11995, 12017, 12013, 33673, 11200, 11198, 11178, 11186, 11184, 11176, 11196, 11202, 22456, 22452, 22464, 22460, 28844, 28846, 28850, 28848, 11978, 11989, 11987, 11985, 28665, 28659, 28661, 28710, 12038, 11377, 12032, 12034, 29984, 29988, 29990, 29986, 34562, 34828, 35683, 34317]
            this.addSeries(arr, 'T2 Ships');
        },getT2Mods: function()
        {
            arr = [1296, 1276, 1286, 1266, 1198, 1306, 11648, 11644, 11646, 11642, 11259, 11249, 11229, 11219, 11239, 11269, 20351, 20343, 20349, 20347, 20353, 20345, 1183, 3530, 3540, 4621, 1436, 4254, 22291, 3888, 3472, 3488, 3480, 3496, 3504, 3568, 3558, 2024, 3578, 1248, 1447, 2032, 2038, 11577, 11578, 2048, 30832, 30834, 24427, 4405, 24417, 33824, 24438, 2262, 2258, 2261, 2260, 2259, 2575, 2571, 2559, 2567, 2563, 2117, 25563, 13003, 12267, 12271, 13001, 12259, 12263, 3065, 3041, 3033, 3285, 3057, 3049, 3520, 3025, 3017, 3512, 3009, 3001, 2993, 4147, 2985, 34595, 1319, 17912, 24305, 18068, 4290, 4288, 4286, 4284, 4282, 4280, 4278, 4276, 4274, 4272, 4270, 4268, 4266, 4264, 4262, 25812, 519, 2364, 2355, 3655, 3665, 3186, 3178, 3170, 3162, 3154, 3146, 3138, 3130, 3122, 3114, 3106, 3098, 3090, 12356, 3082, 12346, 3074, 10680, 1405, 10190, 482, 37451, 28576, 28578, 35790, 35771, 4256, 19739, 2410, 25715, 2404, 33450, 1877, 10631, 2420, 2605, 1236, 2341, 1541, 1960, 2953, 2945, 2937, 16148, 2929, 2969, 2921, 2913, 2977, 2905, 2897, 2889, 2881, 2961, 2873, 2865, 440, 12076, 12084, 438, 12058, 12068, 4372, 4371, 4360, 1355, 1335, 26912, 26913, 26914, 1190, 12221, 12102, 12223, 4299, 4296, 3986, 1964, 1969, 3588, 406, 3598, 3608, 3618, 2104, 30836, 17901, 25771, 4260, 4258, 33201, 33199, 33197, 4014, 2592, 2588, 2584, 2580, 1952, 2539, 2547, 2531, 2553, 24443, 10842, 400, 10850, 10858, 380, 3851, 3831, 3841, 1256, 2303, 2299, 2297, 2301, 2281, 1422, 394, 1855, 4294, 4292, 1987, 1549, 1559, 1553, 1565, 3899, 3909, 3903, 3915, 3939, 3949, 3943, 3955, 3979, 3989, 3983, 3995, 527, 22229, 33272, 2333, 19806, 1978, 1999, 4250, 4252, 11640, 4248, 448, 3244, 2109, 37546]
            this.addSeries(arr, 'T2 Mods');
        },getDeadspaceMods: function()
        {
            arr = [19221, 19217, 19223, 19227, 19229, 19225, 19231, 19237, 19241, 19233, 19245, 19239, 19243, 19235, 19247, 19251, 19253, 19249, 19255, 19295, 19289, 19303, 19311, 19301, 19297, 19299, 19293, 19187, 19189, 19191, 19175, 19177, 19179, 19208, 19207, 19202, 19201, 19204, 19203, 19206, 19205, 19181, 19183, 19185, 19169, 19171, 19173, 19198, 19200, 19195, 19193, 19196, 19194, 19197, 19199, 4349, 4348, 4347, 19284, 19288, 19286, 19282, 19262, 19258, 19260, 19264, 19268, 19272, 19270, 19266, 19278, 19274, 19276, 19280, 2050, 4345, 4346, 19283, 19287, 19285, 19281, 19261, 19257, 19259, 19263, 19267, 19271, 19269, 19265, 19277, 19273, 19275, 19279]
            this.addSeries(arr, 'Deadspace');
        },
    },
    ready: function()
    {
        this.createGraph();
        
    }
});
