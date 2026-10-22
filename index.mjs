import * as echarts from 'echarts';
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';
import path from 'node:path';

const OUTPUT_DIR = './output_charts';
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const FONT_PATH = path.resolve('./fonts/ipag.ttf');
if (!fs.existsSync(FONT_PATH)) {
  console.error(`エラー: フォントファイルが見つかりません: ${FONT_PATH}`);
  process.exit(1);
}
const fontBuffer = fs.readFileSync(FONT_PATH);
const FONT_NAME = 'IPAGothic';

const datasets = [
  {
    name: '東京支店',
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    values: [120, 190, 150, 220, 260, 310]
  },
  {
    name: '大阪支店',
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    values: [90, 140, 200, 180, 230, 270]
  },
  {
    name: '福岡支店',
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    values: [80, 110, 130, 160, 190, 210]
  }
];

function renderChartToPng(item) {
  const chart = echarts.init(null, null, {
    renderer: 'svg',
    ssr: true,
    width: 800,
    height: 500
  });

  chart.setOption({
    textStyle: {
      fontFamily: FONT_NAME
    },
    title: {
      text: `${item.name} 2026年上半期 売上実績`,
      left: 'center',
      top: 20,
      textStyle: {
        fontFamily: FONT_NAME,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333'
      }
    },
    grid: {
      top: 80,
      left: 60,
      right: 40,
      bottom: 50
    },
    xAxis: {
      type: 'category',
      data: item.labels,
      axisLabel: { fontFamily: FONT_NAME, fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      name: '売上（万円）',
      nameTextStyle: { fontFamily: FONT_NAME, fontSize: 12 }
    },
    series: [
      {
        type: 'bar',
        data: item.values,
        itemStyle: { color: '#5470c6', borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: 'top',
          fontFamily: FONT_NAME,
          fontSize: 11
        }
      }
    ]
  });

  const svgString = chart.renderToSVGString();
  chart.dispose();

  const resvg = new Resvg(svgString, {
    fitTo: { mode: 'width', value: 800 },
    font: {
      fontBuffers: [fontBuffer],
      defaultFontFamily: FONT_NAME,
      loadSystemFonts: false
    }
  });

  return resvg.render().asPng();
}

for (const item of datasets) {
  const pngBuffer = renderChartToPng(item);
  const outputPath = path.join(OUTPUT_DIR, `${item.name}.png`);
  fs.writeFileSync(outputPath, pngBuffer);
  console.log(`生成完了: ${outputPath}`);
}
