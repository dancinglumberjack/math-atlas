// Original, fixed worked examples. These explain an idea before a separate
// practice problem; viewing a card does not grade or certify the learner.
const card = (title, body, visual, caption, actionLabel = 'See the next part') => ({title,body,visual,caption,actionLabel});
const concept = (id,title,steps,parentTip) => ({id,title,bandIds:['elementary'],missionIds:[],steps,parentTip});
const base = (hundreds,tens,ones,teachingTrade=false) => ({type:'base-ten',hundreds,tens,ones,...(teachingTrade?{teachingTrade:true}:{})});
const numberLine = (min,max,end,tickStep,rest={}) => ({type:'number-line',min,max,start:min,end,tickStep,...rest});
const fractionLine = (denominator,end,rest={}) => numberLine(0,2,end,1/denominator,{fractionDenominator:denominator,...rest});
const fraction = (parts,selected) => ({type:'fraction',parts,selected,wholeSize:1,showNotation:true,emphasize:'notation'});
const measurement = (kind,value,max,tickStep,unit,label) => ({type:'measurement',kind,value,max,tickStep,unit,label});
const votes = kind => ({type:'data',kind,labels:['Kites','Balls','Books'],values:[6,4,8],key:2,max:10,title:'Playtime votes'});
const lengths = () => ({type:'data',kind:'line-plot',values:[1,1.25,1.25,1.5,1.75],min:0,max:2,tickStep:.25,fractionDenominator:4,unit:'in',title:'Five ribbon lengths'});
const shape = (target,caption) => ({type:'shapes',mode:'attributes',target,shapes:[target],showAttributes:true,showLabels:true,caption});

export const yearConcepts = [
  concept('g3-place-value','The bundles can change. The amount stays.',[
    card('Meet one hundred','One hundred contains ten tens. Each ten contains ten ones.',base(1,0,0),'1 hundred = 10 tens = 100 ones.'),
    card('Read each place','243 has two hundreds, four tens, and three ones. Their values add to 243.',base(2,4,3),'200 + 40 + 3 = 243.'),
    card('Trade a hundred for ten tens','Rename one of the hundreds as ten tens. We now have one hundred, fourteen tens, and three ones.',base(1,14,3,true),'100 + 140 + 3 is still 243.'),
    card('Trade a ten for ten ones','Return to two hundreds. Trade one of the four tens for ten ones: two hundreds, three tens, thirteen ones.',base(2,3,13,true),'200 + 30 + 13 is also 243. A trade does not add or remove anything.','Try a bundle trade')
  ],'Point to one bundle and name its value. After each trade, check that the total is unchanged. Counting bundles alone does not count the ones inside them.'),

  concept('g3-rounding','Rounding chooses a nearby benchmark',[
    card('Choose the place first','To round 146 to the nearest ten, find the tens on either side: 140 and 150.',numberLine(140,150,146,10,{roundTo:10}),'146 is six away from 140 and four away from 150. Choose 150.'),
    card('What if both are equally near?','145 is halfway between 140 and 150. For these positive whole numbers, we choose the greater benchmark when tied.',numberLine(140,150,145,5,{roundTo:10}),'Both distances are five. Rounded to the nearest ten, 145 becomes 150.'),
    card('Hundreds use different neighbors','For the nearest hundred, place 147 between 100 and 200. It is closer to 100.',numberLine(100,200,147,50,{roundTo:100}),'147 is 47 away from 100 and 53 away from 200.'),
    card('The requested place matters','The same 147 rounds to 150 to the nearest ten, but to 100 to the nearest hundred.',numberLine(140,150,147,5,{roundTo:10}),'Rounding changes the estimate, not the original number 147.','Try choosing the closer benchmark')
  ],'Name the requested place before choosing benchmarks. Place a counter on a number line and compare both distances. Check halfway examples and exact multiples too.'),

  concept('g3-regroup-add','Adding with bundle trades',[
    card('Keep equal places together','Start with 276. We will add 158: one hundred, five tens, and eight ones.',base(2,7,6),'276 + 158 combines hundreds with hundreds, tens with tens, and ones with ones.'),
    card('Combine before trading','Together we have three hundreds, twelve tens, and fourteen ones.',base(3,12,14,true),'300 + 120 + 14 = 434. This is a correct, unbundled name for the sum.'),
    card('Bundle ten ones','Trade ten of the fourteen ones for one ten. Now there are three hundreds, thirteen tens, and four ones.',base(3,13,4,true),'300 + 130 + 4 is still 434.'),
    card('Bundle ten tens','Trade ten of the thirteen tens for one hundred. Four hundreds, three tens, and four ones make 434.',base(4,3,4),'276 + 158 = 434. Each trade kept the amount unchanged.','Try combining and trading')
  ],'Let your learner describe each trade. A carried digit represents a bundle with a place value. The intermediate names are valid amounts, even before the trades finish.'),

  concept('g3-regroup-subtract','Make smaller bundles before taking away',[
    card('Look at the starting collection','We have 302 and want to take away 146. Two loose ones are not enough to remove six ones.',base(3,0,2),'302 = 3 hundreds + 0 tens + 2 ones.'),
    card('Open a hundred','Trade one hundred for ten tens. Nothing has been removed yet.',base(2,10,2,true),'200 + 100 + 2 is still 302.'),
    card('Open one of those tens','Trade one ten for ten ones. We now have two hundreds, nine tens, and twelve ones.',base(2,9,12,true),'200 + 90 + 12 is still 302. There are now enough loose ones.'),
    card('Now take away 146','Remove one hundred, four tens, and six ones. One hundred, five tens, and six ones remain.',base(1,5,6),'302 − 146 = 156. Check: 156 + 146 = 302.','Try a take-away trade')
  ],'Pause after each exchange to confirm the collection still totals 302. The amount decreases only when 146 is removed. A zero in one place does not prevent a trade from a larger bundle.'),

  concept('g3-fraction-line','Fractions are places on a number line',[
    card('Choose a whole interval','The distance from zero to one is one whole. Keep that distance fixed along the line.',fractionLine(4,1),'One whole is a length, rather than a single tick mark.'),
    card('Split the interval equally','Four equal lengths fit between zero and one. One of those lengths reaches one quarter.',fractionLine(4,.25,{moves:[.25]}),'Each step is 1/4. Count spaces between marks, not the marks themselves.'),
    card('Count equal lengths from zero','Three quarter-length steps reach three quarters. The endpoint names the fraction 3/4.',fractionLine(4,.75,{moves:[.25,.25,.25]}),'3 × 1/4 = 3/4.'),
    card('Keep going past one','Four quarters reach one whole. A fifth quarter reaches 5/4, which is one whole and one quarter.',fractionLine(4,1.25,{moves:[.25,.25,.25,.25,.25]}),'Fractions can name numbers greater than one. The quarter-length has not changed.','Try placing a fraction')
  ],'First point to zero, one, and the interval defining the whole. Count equal-length spaces. Keep the same unit length on both sides of one.'),

  concept('g3-fraction-whole','Whole numbers have fraction names too',[
    card('All the quarters make one','Four quarter-length pieces fill one whole interval. Four quarters and one name the same number.',fractionLine(4,1),'4/4 = 1. They occupy the same point.'),
    card('Two wholes contain eight quarters','Keep counting the same quarter-length pieces. Eight quarters reach two wholes.',fractionLine(4,2),'8/4 = 2. The whole did not grow; we counted two copies of it.'),
    card('A whole can be the unit piece','When each piece is one whole, two pieces are two wholes. We can write this number as 2/1.',fractionLine(1,2),'2/1 = 2. A fraction name can represent a whole number.','Try a different name for a whole')
  ],'Keep the size of one whole fixed. Match different names to the same location, including one and two. Avoid treating every fraction as less than one.'),

  concept('g3-fraction-compare','Compare shares of the same whole',[
    card('Keep the whole the same size','This whole ribbon has six equal parts. Two are selected, so the selected share is 2/6.',fraction(6,2),'Remember the size of this entire ribbon.'),
    card('Equal-sized pieces: count them','Keep that same whole and the same six pieces. Four selected pieces cover more than two.',fraction(6,4),'4/6 > 2/6 because four sixths cover more than two sixths.'),
    card('One piece can have a different size','Split the same whole into three equal pieces. One third covers the same amount as two sixths.',fraction(3,1),'1/3 = 2/6. Thirds are larger pieces than sixths of the same whole.'),
    card('Same count: compare piece sizes','Select just one of six equal pieces. One sixth covers less than one third of this same whole.',fraction(6,1),'1/6 < 1/3. More equal pieces in the whole means each piece is smaller.','Try comparing two shares')
  ],'Use two identical paper ribbons if helpful. Compare shares only when their wholes match. With equal denominators compare counts; with equal numerators compare the sizes of the equal pieces.'),

  concept('g3-capacity','Read liquid amounts with a unit',[
    card('Find the unit and zero','This container is marked in liters, written L. Its empty level is zero.',measurement('capacity',0,5,1,'L','Empty container'),'Each numbered interval is one liter.'),
    card('Read the marked level','The liquid reaches the two-liter mark. The amount is 2 L.',measurement('capacity',2,5,1,'L','Two liters of water'),'Read the scale, rather than guessing from the picture alone.'),
    card('Combine amounts with the same unit','Add one liter to the two liters. The new amount is three liters.',measurement('capacity',3,5,1,'L','After adding one liter'),'2 L + 1 L = 3 L. Keep the unit with the amount.','Try reading a liquid scale')
  ],'Point to the unit, the zero mark, and the size of each interval. These are simplified mathematical containers. Use the same unit throughout an addition or subtraction problem.'),

  concept('g3-mass','A scale tells an amount of mass',[
    card('Read a mass in grams','This parcel has a mass of 200 grams, written 200 g. Each scale interval is 50 g.',measurement('mass',200,1000,50,'g','First parcel'),'Four 50-gram intervals reach 200 g.'),
    card('Keep the second amount separate','A second parcel has a mass of 350 g. Both parcels are measured in the same unit.',measurement('mass',350,1000,50,'g','Second parcel'),'350 g is seven intervals of 50 g.'),
    card('Combine the masses','Together, the parcels have a mass of 550 g: 200 g plus 350 g.',measurement('mass',550,1000,50,'g','Both parcels together'),'200 g + 350 g = 550 g.'),
    card('Larger objects can use kilograms','This sack is measured in kilograms, written kg. The scale shows 2 kg.',measurement('mass',2,5,1,'kg','A sack of rice'),'Read the unit every time: this scale uses kilograms.','Try reading a mass scale')
  ],'Choose grams or kilograms to suit the object. Keep units alongside numbers. These exercises use matching units within each calculation; conversions are a separate idea.'),

  concept('g3-scaled-data','A graph key tells what one mark means',[
    card('Read the key before counting','In this picture graph, one symbol stands for two votes. One symbol is two votes, not one vote.',{...votes('picture'),values:[2,0,0]},'Key: one symbol = two votes.'),
    card('Count using the key','Three symbols mean six votes for kites. Two symbols mean four votes for balls.',votes('picture'),'Kites: 6 votes. Balls: 4 votes. Books: 8 votes.'),
    card('The same data can use bars','These bars show those same vote counts. The scale increases by two votes at each marked step.',votes('bar'),'Changing the graph type does not change the votes.'),
    card('Compare the data amounts','Books received eight votes and balls received four. The difference is four votes.',votes('bar'),'8 − 4 = 4 more votes for books than for balls.','Try reading a graph key')
  ],'Ask what one icon or scale interval represents before asking how many. Distinguish symbols from the data amounts they stand for. Start the bar scale at zero.'),

  concept('g3-line-plot','A line plot records measurements',[
    card('Measure from zero','The ruler is split into quarter-inch intervals. This ribbon starts at zero and ends at one and one-quarter inches.',{...measurement('length',1.25,2,.25,'in','A ribbon measured from zero'),fractionDenominator:4},'The ribbon is 1¼ inches long.'),
    card('Give each ribbon one mark','Five ribbons measure 1, 1¼, 1¼, 1½, and 1¾ inches. Put one mark above each ribbon’s measurement.',lengths(),'Two ribbons share the 1¼-inch position, so their marks stack.'),
    card('Count measurements, not positions','There are five marks altogether. Each represents one ribbon, even when two marks sit above the same value.',lengths(),'Five marks record five ribbons. Each small interval is ¼ inch.','Try reading a measurement plot')
  ],'Begin a ruler measurement at zero. Check the interval size before locating a value. On the line plot, count every stacked mark once; equal measurements share a position.'),

  concept('g3-shape-families','Shapes can belong to more than one family',[
    card('A rectangle has four right angles','A rectangle has four straight sides and four square corners, called right angles.',shape('rectangle','A rectangle has four sides and four right angles.'),'Opposite sides have equal lengths.'),
    card('A square is a rectangle too','A square has four right angles, so it is a rectangle. It also has four equal sides.',shape('square','A square meets the rectangle rule and the equal-side rule.'),'A square belongs to more than one shape family.'),
    card('A rhombus has four equal sides','All four sides of a rhombus are equal. A square meets this rule too; other rhombuses can have different corner angles.',shape('rhombus','A rhombus has four equal sides.'),'The side and angle rules matter more than the direction the picture faces.'),
    card('Quadrilateral is a larger family','This shape also has four straight sides. It is a quadrilateral, even though it is not a rectangle or a rhombus.',shape('trapezoid','Four sides make this a quadrilateral.'),'Rectangles, rhombuses, squares, and this trapezoid all belong to the quadrilateral family.','Try sorting by a shape rule')
  ],'Trace sides and inspect corners. Rotate a paper shape to show that its family does not change. A larger family can contain several smaller families.'),

  concept('g3-grouped-products','Packs inside packs: keep track of every item',[
    card('Count the boxes first','Three bags each hold two boxes. Each box holds four items. Three times two makes six boxes, each with four items.',{type:'array',rows:6,columns:4},'(3 × 2) × 4 = 6 × 4 = 24 items.'),
    card('Count one bag first instead','Each bag holds two boxes of four, or eight items. Three bags still hold twenty-four items.',{type:'array',rows:3,columns:8},'3 × (2 × 4) = 3 × 8 = 24. Regrouping keeps all the items.'),
    card('Use the fact to count tens','Now a box holds four tens, or forty items. Six such boxes hold twenty-four tens: two hundreds and four tens.',base(2,4,0),'6 × 40 = 6 × 4 tens = 24 tens = 240 items.','Try regrouping some packs')
  ],'Name the units: bags, boxes, and items. Regrouping changes which multiplication is done first; it does not reorder or discard factors. A product of tens must be counted in tens.'),

  concept('g3-minute-clock','The small ticks count single minutes',[
    card('Start with a familiar five','At 2:15, the long hand points to 3. Three numbered steps count five, ten, fifteen minutes.',{type:'clock',hour:2,minute:15,showDigital:true},'The short hand is already a little past two.'),
    card('Count the extra small ticks','At 2:18, the long hand is three small ticks past 3. Fifteen minutes plus three minutes makes eighteen.',{type:'clock',hour:2,minute:18,showDigital:true},'2:18 means eighteen minutes after two.'),
    card('Try another part of the face','At 2:32, the long hand is two small ticks past 6. Thirty plus two makes thirty-two minutes.',{type:'clock',hour:2,minute:32,showDigital:true},'The minute hand counts minutes. The short hand moves gradually toward three.','Try a single-minute clock')
  ],'Find the last five-minute mark, then count the extra one-minute ticks. Keep the hands distinct by length as well as color. Let the hour hand move gradually.'),

  concept('g3-elapsed-minutes','Break a time interval at the hour',[
    card('Keep the starting time','Our walk starts at 4:46 and ends at 5:09. First find the minutes from 4:46 to 5:00.',{type:'clock',hour:4,minute:46,showDigital:true},'There are 60 − 46 = 14 minutes until the next hour.'),
    card('Reach the whole hour','After fourteen minutes, the clock reaches 5:00. We have completed the first part of the interval.',{type:'clock',hour:5,minute:0,showDigital:true},'First part: fourteen minutes. Keep that amount to add later.'),
    card('Add the minutes after the hour','From 5:00 to 5:09 takes nine more minutes. Fourteen plus nine gives twenty-three minutes for the whole walk.',{type:'clock',hour:5,minute:9,showDigital:true},'4:46 to 5:09: 14 + 9 = 23 minutes.','Try finding an elapsed interval')
  ],'Write the starting and finishing times before calculating. Split at the whole hour and label both intervals in minutes. An ending clock reading is different from an elapsed duration.'),
];
