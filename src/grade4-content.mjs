/* Original Grade 4 study activities. Bounded replay, visual reasoning, and
   independent worked examples support practice rather than certify mastery. */
const M = (suffix,title,topicId,unit,conceptKey,standards,goal,prerequisite,workedExample,explainPrompt,reviewPrompt) => ({
  id:`g4y-${suffix}`,title,topicId,unitId:`g4-unit-${unit}`,bandId:'elementary',gradeIds:['4'],conceptKey,conceptId:conceptKey,
  worldId:['geometry','measuring','measurement','data'].includes(topicId)?'studio':['fractions','decimals'].includes(topicId)?'garden':'workshop',
  standards,sourceIds:[],lessonId:null,minutes:9,goal,skill:goal,
  teacherNotes:'Build or inspect the model before calculating. Name the unit in each part, explain a strategy, and check with another representation. Completion records practice.',
  lessonPlan:{goal,prerequisite,workedExample,explainPrompt,reviewPrompt}
});
export const g4Missions = [
  M('place-shift','A digit changes its job','place-value',1,'g4-place-value',['4.NBT.A.1'],'Explain a tenfold value change between adjacent places.','Read thousands, hundreds, tens, and ones.','The 6 in 6,000 has ten times the value of the 6 in 600. One place left multiplies the value by ten.','What does the digit count in each place?','Compare the value of 7 in 7,000 and 700.'),
  M('read-million','Big numbers have small parts','place-value',1,'g4-place-value',['4.NBT.A.2'],'Read, expand, and compare whole numbers through one million.','Read a three-digit number with an empty place.','405,016 is 400,000 + 5,000 + 10 + 6. A zero keeps the empty place without contributing value.','Which place is the first one that differs in the comparison?','Give 708,024 an expanded name.'),
  M('round-big','Choose a useful nearby number','place-value',1,'g4-place-value',['4.NBT.A.3'],'Round a large whole number to a named place using neighboring benchmarks.','Locate a number between two multiples of ten.','462,700 lies closer to 460,000 than 470,000, so it rounds to 460,000 to the nearest ten thousand.','Which place are we rounding to, and where is halfway?','Round 685,000 to the nearest ten thousand and explain the tie.'),
  M('add-sub-bundles','Combine and return the bundles','addition',1,'g4-place-value',['4.NBT.B.4'],'Calculate multi-digit sums and differences with place-value meaning.','Trade ten units for one of the next larger unit.','2,786 + 1,457 = 4,243. Ones and tens each make a new bundle; subtracting 1,457 from 4,243 returns 2,786.','How does each written trade keep track of a real unit?','Explain and check 4,205 − 1,768.'),
  M('times-tens','The factor is a bundle','multiplication',2,'g4-products',['4.NBT.B.5'],'Multiply a one-digit number by a multiple of ten.','Use known facts and count equal ten-bundles.','5 × 30 means five groups of three tens: fifteen tens, or 150.','Why is the answer fifteen tens rather than fifteen ones?','Use 7 × 4 to explain 7 × 40.'),
  M('four-digit-times','Four places, one product','multiplication',2,'g4-products',['4.NBT.B.5'],'Decompose a four-digit factor and combine its partial products.','Use place value and the distributive property.','2,013 × 3 = 6,000 + 30 + 9 = 6,039. The zero hundreds contribute zero.','Where can each partial product be found in the area model?','Explain 1,205 × 4 without losing the zero place.'),
  M('area-products','A product with four rooms','multiplication',2,'g4-products',['4.NBT.B.5'],'Multiply two two-digit numbers with a partitioned area model.','Find the area of a rectangle and add disjoint parts.','21 × 13 = 20 × 10 + 20 × 3 + 1 × 10 + 1 × 3 = 273.','Why are four partial areas needed?','Draw and explain a model for 34 × 12.'),
  M('multiplication-story','More packs at the supply station','multiplication',2,'g4-products',['4.NBT.B.5','4.OA.A.3'],'Use multi-digit multiplication in a changing equal-pack story.','Distinguish pack count from items in each pack.','Five packs of 26 hold 130 items. Two more full packs add 52 items, making 182.','What quantity changes when another whole pack arrives?','Compare adding two items with adding two complete packs.'),
  M('share-hundreds','Share the friendly part first','division',3,'g4-quotients',['4.NBT.B.6'],'Share a three-digit whole using a friendly multiple and a remainder part.','Connect division with equal groups and multiplication.','436 shared among four groups can split as 400 and 36. Each share is 100 + 9 = 109.','Do both parts keep the same number of groups?','Split 525 into friendly parts when sharing among five.'),
  M('quotient-chunks','Pack whole groups in chunks','division',3,'g4-quotients',['4.NBT.B.6'],'Add partial quotients while keeping the divisor fixed.','Read a known group size and a remaining total.','For 174 ÷ 6, twenty groups use 120. Nine more groups use 54. The quotient is 29.','What does each chunk count: items or complete groups?','Use ten-group chunks to explain 184 ÷ 8.'),
  M('remainder-meaning','The last few still matter','division',3,'g4-quotients',['4.NBT.B.6','4.OA.A.3'],'Interpret whole groups, a remainder, and an extra container in context.','Know a remainder is smaller than one full group.','Twenty-three riders fit in four full five-seat cars with three riders left. Everyone needs five cars.','Should the leftover be kept, discarded, or given another container here?','Compare packing only full boxes with seating every rider.'),
  M('divide-check','Make the multiplication receipt','division',3,'g4-quotients',['4.NBT.B.6'],'Check a quotient by multiplying it by the divisor.','Read a quotient as a group count or a share size.','216 ÷ 6 = 36 because 6 × 36 = 216. A proposed quotient of 37 would require six extra objects.','How does multiplying expose an incorrect quotient?','Check 245 ÷ 7 with a multiplication equation.'),
  M('factor-pairs','All the ways to make a rectangle','multiplication',4,'g4-number-structure',['4.OA.B.4'],'Find factor pairs and relate factors to exact rectangular arrays.','Know that a factor pair multiplies to its whole.','18 has factor pairs 1 and 18, 2 and 9, and 3 and 6. Reverse orientations do not make new unordered pairs.','How do you know every pair has been found?','List the factor pairs of 30 without counting a turn twice.'),
  M('prime-composite','Does another rectangle fit?','multiplication',4,'g4-prime-composite',['4.OA.B.4'],'Distinguish prime and composite numbers and the special case of one.','Find whole-number factor pairs.','11 has just the factors 1 and 11, so it is prime. 15 has 3 and 5 too, so it is composite. One is neither.','Why does one fail the exactly-two-factors rule for prime numbers?','Use arrays to classify 16, 17, and 1.'),
  M('times-as-many','A comparison that multiplies','multiplication',4,'g4-number-structure',['4.OA.A.1','4.OA.A.2'],'Distinguish times as many from an additive difference.','Read an amount and its equal-size copies.','A long ribbon is three times a 6 cm ribbon: 18 cm. It is 12 cm longer, not three centimeters longer.','Which answer is a multiplier, and which answer is a difference?','Draw four copies of a 5 cm strip and compare the lengths.'),
  M('pattern-rule','Follow a rule and notice more','patterns',4,'g4-patterns',['4.OA.C.5'],'Generate an additive pattern and explain a parity feature.','Count on by a constant positive amount.','Start at 3 and add 2: 3, 5, 7, 9. Every term stays odd because adding an even number preserves parity.','Which feature follows from the rule even if it was not stated?','Start at 2, add 5, and describe the even-odd pattern.'),
  M('equivalent-parts','New cuts, the same amount','fractions',5,'g4-fraction-equivalence',['4.NF.A.1'],'Generate equivalent fractions by subdividing every equal piece.','Keep the whole size fixed when naming fractions.','Three fourths is six eighths: each fourth is split in two, doubling both the whole-piece count and the selected-piece count.','Why must the numerator and denominator change together?','Show 2/5 as tenths using the same whole.'),
  M('compare-fractions','A fair comparison keeps one whole','fractions',5,'g4-fraction-equivalence',['4.NF.A.2'],'Compare unlike fractions using equal wholes and useful partitions.','Locate a fraction between zero and one.','Compare 1/3 and 3/4 as 4/12 and 9/12. The second covers more of the same whole.','Can a benchmark or a common partition make the comparison clear?','Compare 3/8 and 2/5 with a model of equal wholes.'),
  M('join-fractions','Keep the size of each piece','fractions',5,'g4-fraction-operations',['4.NF.B.3a','4.NF.B.3b','4.NF.B.3d'],'Add and subtract like-denominator shares of the same whole.','Understand a fraction as repeated unit fractions.','1/8 + 2/8 = 3/8 because three eighth-size pieces join. Taking away 1/8 returns 2/8.','Why does the denominator stay eight when the pieces join?','Describe two ways to decompose 6/8.'),
  M('mixed-parts','Whole strips and extra pieces','fractions',5,'g4-fraction-operations',['4.NF.B.3c'],'Rename mixed numbers and add or subtract matching fractional units.','Know that all the denominator-count pieces make one whole.','1 2/5 = 7/5. Adding 3/5 reaches 10/5, or 2 wholes.','Where is one full whole hiding in the fraction count?','Show 1 3/4 − 2/4 using equal quarter pieces.'),
  M('fraction-times','Whole groups of fractional pieces','fractions',6,'g4-fraction-operations',['4.NF.B.4a','4.NF.B.4b'],'Multiply a fraction by a whole number using equal copies.','Add matching unit fractions and name more than one whole.','Four copies of 2/6 contain eight sixth-size pieces: 4 × 2/6 = 8/6.','What stays the same about the unit piece when more copies join?','Show three groups of 3/8 without changing the whole.'),
  M('fraction-story','Ribbons for every little kite','fractions',6,'g4-fraction-operations',['4.NF.B.4c'],'Use a whole-number multiple of a fraction in a measurement story.','Connect number of copies with repeated equal lengths.','Four kites each need 3/8 m of ribbon. They need 12/8 m, or 1 1/2 m altogether.','Does the answer count kites, unit pieces, or meters?','Estimate the total before finding five copies of 1/3 m.'),
  M('tenths-hundredths','One grid, two useful names','fractions',6,'g4-decimals',['4.NF.C.5','4.NF.C.6'],'Connect tenths, hundredths, and decimal notation.','Keep one whole fixed while subdividing equal parts.','4/10 = 40/100 = 0.40. Adding 7/100 gives 47/100, written 0.47.','Why can a zero after the four leave the amount unchanged?','Represent 0.62 as tenths and hundredths on a grid.'),
  M('decimal-order','Read place value after the point','fractions',6,'g4-decimals',['4.NF.C.7'],'Compare decimal fractions to hundredths with a fixed whole.','Recognize tenths and hundredths as different-sized units.','0.5 is 50/100 and is greater than 0.47. More written digits do not automatically mean a larger number.','Can you rename both numbers as hundredths?','Compare 0.6, 0.60, and 0.58 with one grid size.'),
  M('unit-conversions','The unit changes, the amount stays','measuring',7,'g4-measure-data',['4.MD.A.1'],'Convert larger units to smaller units within one measurement system.','Use a stated unit relationship and multiply equal groups.','2 m = 200 cm, because every meter contains 100 centimeters. Four hours contain 4 × 60 = 240 minutes.','Does changing the unit change the actual length or duration?','Make a table for one, two, and three kilograms in grams.'),
  M('measurement-story','The picnic jug has a plan','measuring',7,'g4-measure-data',['4.MD.A.2'],'Convert and combine liquid amounts with matching units.','Know one liter equals one thousand milliliters.','One liter and 350 mL plus 650 mL make 2,000 mL. Convert the liter before adding all the milliliters.','Why must the amounts use the same unit before we add?','Combine 3 L 200 mL and 800 mL and give two equivalent names.'),
  M('fraction-plot','Every measured ribbon leaves a mark','data',7,'g4-fraction-plots',['4.MD.B.4'],'Use a fractional measurement plot to find counts, differences, and totals.','Read quarter-unit marks and count each plotted object once.','Ribbons of 1/4, 1/2, 1/2, and 3/4 m make four marks. Their total is 2 m, and the length range is 1/2 m.','What changes when you count marks versus adding their measured lengths?','Plot four paper-strip lengths and compare the longest and shortest.'),
  M('area-perimeter','The garden covering and its border','measurement',7,'g4-rectangle-formulas',['4.MD.A.3'],'Apply rectangle area and perimeter and recover a missing side.','Distinguish square units of area from units around a boundary.','A 7-by-4 garden has area 28 square meters and perimeter 22 meters. Given area 28 and length 7, its width is four.','Which calculation counts covering, and which follows the outside edge?','Find the width of a rectangle with area 36 and length 9.'),
  M('angle-tool','Measure the turn, not the arm','geometry',8,'g4-angle-lines',['4.MD.C.5','4.MD.C.6','4.MD.C.7'],'Measure an angle and use addition to find an unknown angle part.','Recognize a shared endpoint and a right angle.','A 35-degree turn and a 55-degree turn together make a right angle of 90 degrees. Longer arms do not change the turn.','Where is zero on the protractor, and which scale follows this turn?','Split a straight 180-degree angle into 70 degrees and an unknown part.'),
  M('line-properties','Two lines have a relationship','geometry',8,'g4-angle-lines',['4.G.A.1'],'Distinguish parallel, perpendicular, and other intersecting lines.','Recognize a straight line and a right angle.','Parallel lines in a plane do not meet. Perpendicular lines meet at a right angle. Intersecting lines need not be perpendicular.','What feature makes an intersection perpendicular?','Find both parallel and perpendicular sides in a rectangle.'),
  M('symmetry-folds','Fold it and see what matches','geometry',8,'g4-symmetry',['4.G.A.3'],'Identify reflection symmetry lines of squares and nonsquare rectangles.','Compare matching halves of a flat shape.','A nonsquare rectangle has two symmetry lines through opposite side midpoints. Its diagonals do not fold its halves onto each other.','Do the two sides match after a reflection across the proposed line?','Compare the symmetry lines of a square with a nonsquare rectangle.'),
  M('shape-families','The angle and side detectives','geometry',8,'g4-shape-symmetry',['4.G.A.2'],'Classify triangles and quadrilaterals using angles and parallel sides.','Recognize right angles, parallel lines, and four-sided shapes.','A right triangle has one right angle. A square also belongs to the rectangle family because it has four right angles.','Which defining rule is shared by both shape families?','Explain why a square is a rectangle and a rhombus.')
].map((m,index)=>({...m,order:500+index}));

const unitSpecs=[
  ['Big numbers and useful estimates',4,'Read, compare, round, and calculate with larger place-value units.',['Name the value of each digit.','Trade units and choose the rounding place before calculating.'],['Read hundreds, tens, and ones.'],['Read a large number in a book; give an expanded name and a useful rounded estimate.'],['NBT']],
  ['Multiplication has an area story',5,'Build partial products and connect them with multi-digit multiplication.',['Split factors by place value.','Cover each part of the product area exactly once.'],['Multiply small whole numbers and add disjoint areas.'],['Draw a 23-by-12 area as four rectangles; explain each partial product.'],['NBT','OA']],
  ['Division in friendly chunks',5,'Share or pack a whole using partial quotients and interpret the leftovers.',['Keep the divisor fixed across every chunk.','Check divisor × quotient + remainder against the starting whole.'],['Distinguish number of groups from objects in each group.'],['Pack counters into equal bags; compare full bags with bags needed for every counter.'],['NBT','OA']],
  ['Factors, comparisons, and patterns',5,'Use exact factor pairs, multiplicative comparisons, and a repeatable rule.',['Organize factor pairs without counting turns twice.','Distinguish a multiplier from an additive difference.'],['Read equal arrays and apply small multiplication facts.'],['List factor pairs of 24; generate a number pattern and explain its parity.'],['OA']],
  ['Same whole, new fraction names',5,'Explain equivalence and compare, add, and subtract fractional pieces.',['Fix the size of one whole.','Subdivide every piece equally; keep the unit fraction clear.'],['Locate fractions on a number line and name unit fractions.'],['Fold matching strips into thirds and sixths; combine quarters into more than one whole.'],['NF']],
  ['Fraction groups and decimal places',4,'Multiply fractional quantities by whole numbers and read decimal fractions.',['Count equal copies of a fractional amount.','Rename tenths as hundredths before combining or comparing.'],['Add matching fractional pieces and read place value.'],['Use a hundred-square grid to compare 0.5 and 0.47; build three copies of a fractional strip.'],['NF']],
  ['Measure, compare, and use the data',4,'Convert units, use fractional measurement data, and apply rectangle formulas.',['Keep units with quantities and convert before adding.','Distinguish a plot mark, its measured value, area, and perimeter.'],['Read a unit scale and add fractional pieces.'],['Measure paper strips, plot each one, and find their total length; design a small rectangle.'],['MD']],
  ['Angles, lines, and shape families',4,'Measure turns and classify shapes by angles, lines, and reflection symmetry.',['Read a turn from its common endpoint.','Use defining angle and side rules, then test a reflection fold.'],['Recognize right angles and basic shape families.'],['Fold paper rectangles and squares; sketch a 50-degree angle and its partner in a right angle.'],['MD','G']]
];
export const g4Units=unitSpecs.map(([title,weeks,goal,methods,prerequisiteSkills,everydayPractice,domains],i)=>({id:`g4-unit-${i+1}`,title,sequence:i+1,weeks,goal,methods,prerequisiteSkills,everydayPractice,missionIds:g4Missions.filter(m=>m.unitId===`g4-unit-${i+1}`).map(m=>m.id),prerequisiteMissionIds:[],reviewMissionIds:[],sourceUrls:domains.map(d=>`https://www.thecorestandards.org/Math/Content/4/${d}/`)}));

const upper=(kind,details={})=>({type:'upper',kind,...details});
const place=value=>upper('place-value',{value,decimalPlaces:0});
const area=(rows,columns)=>upper('product-area',{rows,columns,showProducts:false});
const quotient=(total,divisor,chunks=[],mode='groups')=>upper('quotient',{total,divisor,chunks,mode});
const convert=(amount,fromUnit,toUnit,factor,showResult=false)=>upper('unit-conversion',{amount,fromUnit,toUnit,factor,showResult});
const bars=(items,maxWholes=3,partitionDen)=>upper('fraction-bars',{bars:items.map(([num,den,label])=>({num,den,label})),maxWholes,...(partitionDen?{partitionDen}:{})});
const grid=value=>upper('decimal-grid',{value,places:2});
const angle=(degrees,showMeasure=false,rest={})=>upper('angle',{degrees,showMeasure,...rest});
const polygons=(shapes,showLabels=false)=>upper('polygons',{shapes,showLabels});
const card=(title,body,visual,caption)=>({title,body,visual,caption,actionLabel:'See the next part'});
const concept=(id,title,steps,parentTip)=>({id,title,bandIds:['elementary'],missionIds:g4Missions.filter(m=>m.conceptKey===id).map(m=>m.id),steps,parentTip});
export const g4Concepts=[
  concept('g4-place-value','The digit stays; its unit changes',[
    card('Name the unit first','In 58,206, the five counts ten-thousands. Its value is 50,000.',place(58206),'50,000 + 8,000 + 200 + 6.'),
    card('One place changes the unit tenfold','Move the five one place right. Its value becomes 5,000, one tenth of 50,000.',place(5286),'50,000 is ten times 5,000.'),
    card('Choose the requested rounding place','58,206 lies between 58,000 and 59,000. It is closer to 58,000.',place(58206),'To the nearest thousand: 58,000.'),
    card('A written trade names a bundle','In 2,786 + 1,457, thirteen ones become one ten and three ones; fourteen tens become one hundred and four tens.',place(4243),'2,786 + 1,457 = 4,243.')
  ],'Write a label above each place. Check that each written trade preserves the amount and that rounding answers the named place.'),
  concept('g4-products','Every partial rectangle belongs once',[
    card('Split one factor by its value','To find 31 × 12, split 31 into 30 and 1, and 12 into 10 and 2.',area([30,1],[10,2]),'31 × 12 = (30 + 1) × (10 + 2).'),
    card('Find the large partial rectangle','Thirty groups of ten contain three hundred units.',area([30],[10]),'30 × 10 = 300.'),
    card('Keep the other three parts','The other parts contain 60, 10, and 2 units. None overlap.',area([30,1],[10,2]),'300 + 60 + 10 + 2.'),
    card('Join the parts into the whole','All four partial products together make 372.',area([30,1],[10,2]),'31 × 12 = 372.')
  ],'Relate each multiplication to its row and column widths. The drawing may use labeled scale changes for large factors; labels state exact quantities.'),
  concept('g4-quotients','Divide the whole without changing the group',[
    card('Keep the group size fixed','For 184 ÷ 8, every complete group holds eight items.',quotient(184,8),'We want the number of eight-item groups.'),
    card('Pack twenty groups first','Twenty groups use 160 items. Twenty-four items remain.',quotient(184,8,[20]),'184 − 20 × 8 = 24.'),
    card('Finish with three groups','The remaining 24 items make three more groups of eight.',quotient(184,8,[20,3]),'20 + 3 = 23 complete groups.'),
    card('Multiply to check the whole','Twenty-three groups of eight use exactly 184. The remainder is zero.',quotient(184,8,[20,3]),'8 × 23 + 0 = 184.')
  ],'Name what the quotient counts. In a sharing story, chunks count an amount in each share; in packing, they count complete groups.'),
  concept('g4-number-structure','Factors and comparisons describe groups',[
    card('A rectangle shows a factor pair','Three equal rows of six fill eighteen positions.',area([3],[6]),'3 × 6 = 18: three and six are factors.'),
    card('Find the other exact rectangles','One by eighteen and two by nine also fill eighteen. Those complete the unordered pairs.',area([2],[9]),'Pairs: (1,18), (2,9), (3,6).'),
    card('Times as many makes copies','Three copies of a six-unit length make eighteen units.',area([3],[6]),'18 is three times as many as 6.'),
    card('A difference answers another question','Eighteen is twelve more than six. A multiplier of three and a difference of twelve describe different relationships.',quotient(18,6,[3]),'18 ÷ 6 = 3; 18 − 6 = 12.')
  ],'Use whole-number arrays for factors. In a comparison, ask whether the question requests copies or an extra amount.'),
  concept('g4-fraction-equivalence','New partitions keep the same whole',[
    card('Start with one fixed whole','Select one of three equal parts. The share is one third.',bars([[1,3,'One third']],1),'The whole keeps its length.'),
    card('Split every part in two','Now six equal pieces fill the same whole, and two are selected.',bars([[1,3,'Thirds'],[2,6,'Sixths']],1,6),'1/3 = 2/6.'),
    card('A common partition helps compare','Compare one third and one half as two sixths and three sixths.',bars([[1,3,'One third'],[1,2,'One half']],1,6),'2/6 < 3/6, so 1/3 < 1/2.'),
    card('Check the amount, not the digit count','The two fractions can have different names while occupying the same amount of a matching whole.',bars([[2,3,'Two thirds'],[4,6,'Four sixths']],1,6),'2/3 = 4/6.')
  ],'Keep the zero-to-one distance and the whole length fixed. A common partition is a new way to count equal units, not a larger whole.'),
  concept('g4-fraction-operations','Count the same-sized pieces',[
    card('Join matching units','One fifth and two fifths join to make three fifths.',bars([[1,5,'First'],[2,5,'Second'],[3,5,'Together']],1),'1/5 + 2/5 = 3/5.'),
    card('Enough pieces make another whole','Five fifths form a whole. Seven fifths therefore name one whole and two fifths.',bars([[7,5,'Seven fifths']],2),'7/5 = 1 2/5.'),
    card('A whole-number factor counts copies','Three copies of two fifths contain six fifth-size pieces.',bars([[2,5,'One copy'],[6,5,'Three copies']],2),'3 × 2/5 = 6/5.'),
    card('The unit remains one fifth','More copies changed the selected piece count. Each piece is still one fifth of the original whole.',bars([[6,5,'One whole and one fifth']],2),'6/5 = 1 1/5.')
  ],'Say the unit fraction aloud. Joining or multiplying copies does not multiply the denominator or change the whole.'),
  concept('g4-decimals','Tenths and hundredths share a grid',[
    card('Fix the square as one whole','Two tenths shade two of ten equal columns.',grid(.2),'2/10 = 0.2.'),
    card('Subdivide each column','Each tenth contains ten hundredths. Twenty small squares show the same share.',grid(.2),'2/10 = 20/100 = 0.20.'),
    card('Add a matching small unit','Three more hundredths bring the share to twenty-three hundredths.',grid(.23),'20/100 + 3/100 = 23/100.'),
    card('Compare using the same whole','Thirty hundredths exceed twenty-three hundredths. The shorter written name 0.3 can be the larger value.',bars([[30,100,'0.30'],[23,100,'0.23']],1,100),'0.3 > 0.23.')
  ],'Use the same whole square for both decimals. Read the place value before counting digits.'),
  concept('g4-measure-data','A smaller unit needs a larger count',[
    card('Rename the same length','Two meters contain two groups of one hundred centimeters.',convert(2,'m','cm',100,true),'2 m = 200 cm.'),
    card('A unit change keeps the amount','Three meters contain three groups of one hundred centimeters. The actual length is unchanged.',convert(3,'m','cm',100,true),'3 m = 300 cm.'),
    card('Use the relationship for this unit','Each liter contains one thousand milliliters. Two liters contain two thousand milliliters.',convert(2,'L','mL',1000,true),'2 L = 2,000 mL.'),
    card('Convert before combining','Two liters plus 400 mL is 2,000 mL plus 400 mL. The total is 2,400 mL.',convert(2,'L','mL',1000,true),'2 L 400 mL = 2,400 mL.')
  ],'Keep the actual quantity fixed when renaming its unit. Write units beside every number before adding or subtracting.'),
  concept('g4-angle-lines','Measure the turn from the common endpoint',[
    card('Two rays make one angle','A fifty-degree angle opens through fifty one-degree turns. Its arm lengths do not set its measure.',angle(50,true),'Angle measure: 50°.'),
    card('Build a right angle from parts','A 50° part and a 40° part combine without overlapping to make 90°.',angle(90,true,{splitAt:50}),'50° + 40° = 90°.'),
    card('Perpendicular means a right-angle meeting','These lines meet at a right angle. Their relationship is perpendicular.',upper('line-pairs',{mode:'perpendicular'}),'Every angle at this crossing is 90°.'),
    card('Parallel lines keep the same direction','These distinct lines in one plane do not meet when extended.',upper('line-pairs',{mode:'parallel'}),'Parallel is a line relationship, not an angle size.')
  ],'Find the common endpoint and the zero ray before reading a protractor. Keep parallel lines in the same plane.'),
  concept('g4-shape-symmetry','Classify shapes with an angle or side rule',[
    card('A right triangle has a defining angle','One angle is a right angle. The triangle belongs to the right-triangle family.',polygons(['right-triangle']),'One 90° angle defines a right triangle.'),
    card('A square belongs to several families','Four right angles make a square a rectangle. Four equal sides also make it a rhombus.',polygons(['square','rectangle','rhombus']),'Shape families can overlap.'),
    card('All acute angles make an acute triangle','Every angle in an acute triangle is less than a right angle.',polygons(['acute-triangle']),'All three angles are below 90°.'),
    card('An obtuse triangle has one wide angle','One angle is greater than 90°. A triangle cannot have two obtuse angles.',polygons(['obtuse-triangle']),'One obtuse angle identifies this category.')
  ],'Trace sides and inspect angles instead of relying on a familiar orientation. State the rule that decides each family.'),
  concept('g4-prime-composite','How many positive factors are there?',[
    card('Start with an exact rectangle','Twelve objects can make a three-by-four rectangle, as well as one-by-twelve and two-by-six.',area([3],[4]),'12 has more than two positive factors.'),
    card('A composite has extra factors','The positive factors of twelve are 1, 2, 3, 4, 6, and 12. That makes twelve composite.',area([2],[6]),'A composite whole number has more than two positive factors.'),
    card('A prime has exactly two','Seven has only the positive factors 1 and 7. Its only whole-number factor rectangle is one by seven.',area([1],[7]),'7 is prime: exactly two distinct positive factors.'),
    card('One is its own special case','One has only one distinct positive factor: one. It meets neither rule.',area([1],[1]),'1 is neither prime nor composite.')
  ],'Count distinct positive factors. Turning an array does not create a new factor, and one is not a prime number.'),
  concept('g4-patterns','A rule explains what comes next',[
    card('Keep the starting number','Start at five and use the rule add six.',place(5),'The first term is 5; it uses zero hops.'),
    card('Repeat exactly the same rule','Add six again and again: five, eleven, seventeen, twenty-three.',{type:'number-line',min:0,max:30,start:5,end:23,tickStep:1,moves:[6,6,6]},'5, 11, 17, 23.'),
    card('Explain an extra feature','Every term stays odd because an even hop keeps the parity of its starting number.',place(23),'Odd + even remains odd.'),
    card('Count hops instead of term labels','The fifth term uses four hops from the first: 5 + 4 × 6 = 29.',place(29),'Five terms need four hops between them.')
  ],'Write the starting term separately from the rule. Ask which patterns follow from the rule and why they must continue.'),
  concept('g4-fraction-plots','Each mark is an object with a length',[
    card('Measure before plotting','Four ribbons measure 1/4, 1/2, 1/2, and 3/4 meter.',{type:'data',kind:'line-plot',values:[.25,.5,.5,.75],min:0,max:1,tickStep:.25,fractionDenominator:4,unit:'m',title:'Four ribbon lengths'},'Each quarter-unit interval is 1/4 m.'),
    card('One ribbon gets one mark','Two ribbons have the same half-meter length, so their two marks stack at one position.',{type:'data',kind:'line-plot',values:[.25,.5,.5,.75],min:0,max:1,tickStep:.25,fractionDenominator:4,unit:'m',title:'Two matching lengths'},'Four marks count four objects.'),
    card('A difference compares measurements','The longest ribbon is 3/4 m and the shortest is 1/4 m. Their difference is 2/4 m.',bars([[3,4,'Longest'],[1,4,'Shortest']],1),'3/4 − 1/4 = 1/2 m.'),
    card('A total adds every length','Count the two half-meter ribbons twice because they are two different ribbons.',bars([[1,4,'First'],[1,2,'Second'],[1,2,'Third'],[3,4,'Fourth']],1),'1/4 + 1/2 + 1/2 + 3/4 = 2 m.')
  ],'Ask what the question counts. A number of ribbons, a difference in meters, and a total in meters are different results.'),
  concept('g4-rectangle-formulas','Cover the inside or follow the boundary',[
    card('Area counts square units','Seven rows of four square units cover this rectangle without gaps.',area([7],[4]),'Area = 7 × 4 = 28 square units.'),
    card('Perimeter follows every outside side','Its boundary has two seven-unit sides and two four-unit sides.',area([7],[4]),'Perimeter = 7 + 4 + 7 + 4 = 22 units.'),
    card('A missing side is an unknown factor','If the area is 28 and one dimension is seven, the other dimension must be four.',area([7],[4]),'7 × ? = 28, so ? = 4 units.'),
    card('Keep the units distinct','Square units measure the covering. Ordinary length units measure each side and the boundary.',area([7],[4]),'Area and perimeter answer different measurement questions.')
  ],'Point to a square unit for area and an edge segment for perimeter. A correct number with the wrong unit describes a different quantity.'),
  concept('g4-symmetry','A reflection fold must match every part',[
    card('Try a midpoint fold','A nonsquare rectangle matches across a line through the midpoints of its longer sides.',upper('symmetry',{shape:'rectangle',axes:'all'}),'A symmetry line reflects one side exactly onto the other.'),
    card('A second rectangle fold works','Its other midpoint line works too. Its diagonal divides equal areas but does not make a matching fold.',upper('symmetry',{shape:'rectangle',axes:'all'}),'A nonsquare rectangle has two reflection symmetry lines.'),
    card('A square adds diagonal folds','A square also matches across both diagonals, in addition to both midpoint lines.',upper('symmetry',{shape:'square',axes:'all'}),'A square has four reflection symmetry lines.'),
    card('Use matching parts as the test','Two halves must match after reflection. Merely having the same area is not sufficient.',upper('symmetry',{shape:'square',axes:'all'}),'Reflect, then match the whole boundary and interior.')
  ],'Fold real paper shapes when useful. Keep reflection symmetry distinct from rotational symmetry and from equal-area partitions.')
];

const byId=new Map(g4Missions.map(m=>[m.id,m]));
const opt=(value,label=value)=>({value:String(value),label:String(label)});
const input=(key,label,min,max,initial=min,step=1)=>({key,label,min,max,initial,step});
const quarterName=n=>Number.isInteger(n)?String(n):`${Math.round(n*4)}/4`;
export function g4TaskFor(id,step=0,seed=1){
  if(!byId.has(id))return null;
  if(!Number.isInteger(step)||step<0||step>2)throw new RangeError('A Grade 4 lesson has three challenges numbered zero to two.');
  if(!Number.isSafeInteger(seed))throw new TypeError('The variation seed must be a safe integer.');
  const v=((seed%3-1)%3+3)%3;
  const out=details=>({id:`${id}:${step}:${seed}`,missionId:id,step,kind:['build','practice','apply'][step],title:['Build the meaning','Try the strategy','Use and check the idea'][step],prompt:'',instruction:'Inspect the given model, build a response, and check when ready.',inputs:[],visual:place(0),answer:{kind:'number',key:'response',label:'Your response'},expected:0,hint:'',explanation:'',why:'',unit:'',...details});
  const pick=(expected,options,details)=>{const choices=options.map(o=>typeof o==='object'?o:opt(o)),offset=((seed%choices.length+step)%choices.length+choices.length)%choices.length;return out({answer:{kind:'choice',label:'Choose your response'},expected:String(expected),choices:[...choices.slice(offset),...choices.slice(0,offset)],...details});};
  const number=(expected,visual,details,max=Math.max(20,Math.ceil(expected*1.2)),stepSize=1)=>out({visual:{...visual,answerKeys:{value:'response'},responseLabel:'Your proposed response'},inputs:[input('response','Your proposed response',0,max,expected===0?Math.min(max,stepSize):0,stepSize)],expected,...details});
  const fraction=(n,d,visual,details,max=3)=>{const task=number(n/d,{...visual,maxWholes:Math.max(visual.maxWholes||1,max),responseDenominator:d},details,max,1/d);task.visual.answerKeys={value:'fraction'};return task;};
  const selectNumber=(expected,visual,details)=>pick(expected,[expected,expected+1,expected===0?2:expected-1],{visual,...details});

  if(id==='g4y-place-shift'){
    const n=[4200,63000,810000][v],leading=[4000,60000,800000][v];
    if(step===0)return pick(10,[10,100,1],{prompt:'How many times the value does a digit have one place to its left?',visual:place(n),hint:'Ten of one place make one of the next place.',explanation:'A digit represents ten times its value when it moves one place left.',why:'Adjacent whole-number places are related by a factor of ten.'});
    return number(step===1?leading:n/10,place(n),{prompt:step===1?`What is the value of the first nonzero digit in ${n.toLocaleString('en-US')}?`:`Divide ${n.toLocaleString('en-US')} by ten. What number results?`,hint:step===1?'Name the digit and the unit it counts.':'Each digit moves one whole-number place to the right.',explanation:step===1?`The leading digit contributes ${leading.toLocaleString('en-US')}.`:`${n} ÷ 10 = ${n/10}.`,why:'A digit and the value of that digit are different ideas.'},1000000,step===1?1000:10);
  }
  if(id==='g4y-read-million'){
    const n=[305042,640108,920006][v];
    if(step===0){const parts=String(n).split('').map((digit,i)=>Number(digit)*10**(5-i)).filter(Boolean);return pick('expanded',[opt('expanded',parts.join(' + ')),opt('digits',String(n).split('').join(' + ')),opt('missing',parts.slice(0,-1).join(' + '))],{prompt:`Which expanded expression names ${n.toLocaleString('en-US')}?`,visual:place(n),hint:'Keep the value of each nonzero place.',explanation:`${n.toLocaleString('en-US')} = ${parts.join(' + ')}.`,why:'Expanded form names each place-value contribution.'});}
    if(step===1)return selectNumber(Math.floor(n/1000),place(n),{prompt:`How many complete thousands are in ${n.toLocaleString('en-US')}?`,hint:'The last three places are the part smaller than one thousand.',explanation:`There are ${Math.floor(n/1000)} complete thousands, with ${n%1000} ones left.`,why:'Counting a larger unit is different from counting individual ones.'});
    return pick('less',[opt('less','Less than <'),opt('equal','Equal to ='),opt('greater','Greater than >')],{prompt:`Compare ${n.toLocaleString('en-US')} with ${(n+1000).toLocaleString('en-US')}.`,visual:place(n),hint:'The second number has one more complete thousand.',explanation:`${n} < ${n+1000}.`,why:'Compare the first place with a different digit.'});
  }
  if(id==='g4y-round-big'){
    const n=[[347200,345000,999600],[582100,585000,899500],[724300,725000,799500]][v][step],size=step===2?1000:10000,lo=Math.floor(n/size)*size,hi=lo+size,rounded=n-lo<size/2?lo:hi;
    return pick(rounded,[lo,hi,lo-size],{prompt:`Round ${n.toLocaleString('en-US')} to the nearest ${step===2?'thousand':'ten thousand'}.`,visual:place(n),hint:`The neighbors are ${lo.toLocaleString('en-US')} and ${hi.toLocaleString('en-US')}. Halfway chooses the greater neighbor.`,explanation:`${n.toLocaleString('en-US')} rounds to ${rounded.toLocaleString('en-US')}.`,why:'Rounding selects a nearby benchmark for a stated place.'});
  }
  if(id==='g4y-add-sub-bundles'){
    const a=[3468,5086,7245][v],b=[1577,2738,1689][v],expected=[a+b,b,a+900][step];
    return number(expected,place(step===1?a+b:a),{prompt:[`Combine ${a} + ${b}.`,`The total is ${a+b}. Remove ${a}. What remains?`,`Start at ${a}. Add 1,000, then remove 100. What is the result?`][step],hint:step===2?'One thousand more and one hundred less is nine hundred more.':'Align like place-value units and record each trade.',explanation:[`${a} + ${b} = ${a+b}.`,`${a+b} − ${a} = ${b}.`,`${a} + 1000 − 100 = ${a+900}.`][step],why:'A written algorithm keeps track of the same place-value units as a bundle model.'},12000);
  }
  if(id==='g4y-times-tens'){
    const a=[6,7,8][v],b=[40,30,60][v];
    if(step===2)return pick('groups',[opt('groups',`${a} groups of ${b}`),opt('extra',`${a} more than ${b}`),opt('difference',`The difference between ${a} and ${b}`)],{prompt:`What does ${a} × ${b} count in this model?`,visual:area([a],[b]),hint:'Each row repeats the same number of units.',explanation:`${a} groups of ${b} contain ${a*b} units.`,why:'Multiplication repeats equal groups; it does not add the factor labels.'});
    const columns=b+(step===1?10:0);return number(a*columns,area([a],[columns]),{prompt:`Find ${a} × ${columns}.`,hint:`Use ${a} × ${columns/10}, then count the resulting tens.`,explanation:`${a} × ${columns} = ${a*columns/10} tens = ${a*columns}.`,why:'The place-value unit in the factor stays part of the product.'},1000,10);
  }
  if(id==='g4y-four-digit-times'){
    const a=[1204,2031,3102][v],b=[3,4,2][v],thousands=Math.floor(a/1000)*1000,expected=[thousands*b,(a-thousands)*b,a*b][step],parts=[1000,100,10,1].map(p=>Math.floor(a/p)%10*p).filter(Boolean);
    return number(expected,area([b],parts),{prompt:[`Find only the thousands part of ${a} × ${b}.`,`Find the product of the remaining ${a-thousands} and ${b}.`,`Combine every partial product. What is ${a} × ${b}?`][step],hint:step===0?`${thousands} × ${b}`:step===1?`The parts below one thousand make ${a-thousands}.`:'Add each place-value part once.',explanation:`${a} × ${b} = ${thousands*b} + ${(a-thousands)*b} = ${a*b}.`,why:'Distributing multiplication over place-value parts preserves the entire product.'},10000);
  }
  if(id==='g4y-area-products'){
    const a=[23,32,24][v],b=[14,12,23][v],at=Math.floor(a/10)*10,bt=Math.floor(b/10)*10,large=at*bt,expected=[large,a*b-large,a*b][step];
    return number(expected,area([at,a%10],[bt,b%10]),{prompt:[`Find the ${at}-by-${bt} partial rectangle.`,`How much area do the other three partial rectangles contribute together?`,`Combine the four parts. What is ${a} × ${b}?`][step],hint:step===1?`Add ${at*(b%10)}, ${(a%10)*bt}, and ${(a%10)*(b%10)}.`:'A partial area equals its own length times width.',explanation:`${a} × ${b} = ${large} + ${a*b-large} = ${a*b}.`,why:'Four non-overlapping partial rectangles exactly cover the complete product area.'},1000);
  }
  if(id==='g4y-multiplication-story'){
    const each=[24,32,18][v],packs=[6,4,7][v],expected=[each*packs,each*2,each*(packs+2)][step];
    return number(expected,area(step===2?[packs,2]:[step===1?2:packs],[each]),{prompt:[`${packs} packs hold ${each} pencils each. How many pencils?`,`Two more full packs arrive. How many pencils do those two packs add?`,`${packs} packs of ${each} pencils get two more equal packs. How many pencils altogether?`][step],hint:'Keep the pack size fixed and count complete packs.',explanation:`${step===1?2:step===2?packs+2:packs} packs × ${each} pencils per pack = ${expected} pencils.`,why:'A multi-step story needs a named quantity at each step.'},400);
  }
  if(id==='g4y-share-hundreds'){
    const total=[324,426,648][v],divisor=[3,3,4][v],friendly=divisor*100,remainder=total-friendly,expected=[100,remainder/divisor,total/divisor][step];
    return number(expected,quotient(step===1?remainder:total,divisor,step===2?[100]:[],'share'),{prompt:[`Share the friendly ${friendly} of ${total} items among ${divisor} groups. How many from that part in each group?`,`Now share the remaining ${remainder} among the same ${divisor} groups. How many more per group?`,`Combine both parts. What is ${total} ÷ ${divisor}?`][step],hint:step===0?`${divisor} × 100 = ${friendly}.`:step===1?'Keep the same number of equal groups.':'Add the two amounts in each share.',explanation:`${total} ÷ ${divisor} = ${friendly} ÷ ${divisor} + ${remainder} ÷ ${divisor} = ${total/divisor}.`,why:'Splitting the dividend keeps the same divisor in both parts.'},250);
  }
  if(id==='g4y-quotient-chunks'){
    const total=[156,168,192][v],divisor=[6,7,8][v],rest=total-20*divisor,expected=[20,rest/divisor,total/divisor][step];
    return number(expected,quotient(step===1?rest:total,divisor,step===2?[20]:[]),{prompt:[`Pack ${20*divisor} items into ${divisor}-item groups. How many groups is this first chunk?`,`After that chunk, ${rest} items remain. How many more ${divisor}-item groups?`,`How many complete ${divisor}-item groups fit ${total} items altogether?`][step],hint:step===2?'Add the chunk counts, not the item counts.':`Groups × ${divisor} = the items in this chunk.`,explanation:`${total} ÷ ${divisor} = 20 + ${rest/divisor} = ${total/divisor}.`,why:'Partial quotients count complete groups; their sum gives the whole quotient.'},40);
  }
  if(id==='g4y-remainder-meaning'){
    const total=[29,38,47][v],divisor=6,q=Math.floor(total/divisor),r=total%divisor,visual=quotient(total,divisor);
    if(step===0)return number(q,visual,{prompt:`${total} riders use six-seat cars. How many cars can be completely full?`,hint:'Build full groups without using more riders than we have.',explanation:`${q} full cars use ${q*divisor} riders. ${r} riders remain.`,why:'The whole-number quotient counts complete groups.'},12);
    return selectNumber(step===1?r:q+1,visual,{prompt:step===1?`${total} riders fill ${q} six-seat cars. How many riders remain?`:`How many six-seat cars are needed for all ${total} riders?`,hint:step===1?`Subtract ${q*divisor} from ${total}.`:'The remaining riders still need a car even if it is not full.',explanation:step===1?`${total} − ${q*divisor} = ${r} riders remain.`:`${q} full cars and one partly filled car mean ${q+1} cars.`,why:'The context determines how a remainder affects the answer.'});
  }
  if(id==='g4y-divide-check'){
    const total=[175,258,364][v],d=[5,6,7][v],q=total/d,visual=quotient(total,d);
    if(step===0)return number(q,visual,{prompt:`Find the whole-number quotient: ${total} ÷ ${d}.`,hint:'Use a friendly chunk, then multiply to check.',explanation:`${d} × ${q} = ${total}, so the quotient is ${q}.`,why:'Division and multiplication describe the same equal-group relationship.'},80);
    if(step===1)return pick('check',[opt('check',`${d} × ${q} = ${total}`),opt('add',`${d} + ${q} = ${d+q}`),opt('subtract',`${total} − ${q} = ${total-q}`)],{prompt:'Which equation checks that quotient directly?',visual,hint:'A quotient multiplied by the divisor must reconstruct the whole.',explanation:`${d} × ${q} = ${total} checks the division.`,why:'An inverse operation checks the meaning of a proposed answer.'});
    return pick('too-many',[opt('too-many','It uses too many items'),opt('too-few','It uses too few items'),opt('fits','It fits exactly')],{prompt:`Someone proposes ${q+1} groups of ${d}. Does that fit ${total} items?`,visual,hint:`${q+1} × ${d} = ${total+d}.`,explanation:`The proposed groups need ${d} more items than the available ${total}.`,why:'A checked answer must match the starting quantity, including any remainder.'});
  }
  if(id==='g4y-factor-pairs'){
    const n=[24,36,48][v];
    if(step===0)return number(n/3,area([3],[n/3]),{prompt:`Three equal rows hold ${n} tiles. How many tiles are in each row?`,hint:'Find the missing factor in 3 × ?.',explanation:`3 × ${n/3} = ${n}.`,why:'A factor pair describes exact whole-number rectangle dimensions.'},20);
    if(step===1)return pick('pair',[opt('pair',`4 and ${n/4}`),opt('sum',`4 and ${n-4}`),opt('near',`5 and ${Math.floor(n/5)}`)],{prompt:`Which pair multiplies exactly to ${n}?`,visual:area([4],[n/4]),hint:'Multiply each proposed pair.',explanation:`4 × ${n/4} = ${n}.`,why:'Both factors must be whole numbers and their product must match the whole.'});
    return selectNumber([4,5,5][v],area([3],[n/3]),{prompt:`How many unordered whole-number factor pairs does ${n} have?`,hint:'List pairs starting with 1; stop when a pair would repeat in reverse.',explanation:[ '24: (1,24), (2,12), (3,8), (4,6).','36: (1,36), (2,18), (3,12), (4,9), (6,6).','48: (1,48), (2,24), (3,16), (4,12), (6,8).' ][v],why:'Turning a factor rectangle preserves its unordered pair.'});
  }
  if(id==='g4y-prime-composite'){
    const n=[[13,21,1],[17,25,1],[19,27,1]][v][step],expected=['prime','composite','neither'][step];
    return pick(expected,[opt('prime','Prime'),opt('composite','Composite'),opt('neither','Neither')],{prompt:`Classify ${n} using its positive whole-number factors.`,visual:area([1],[n]),hint:step===2?'A prime needs exactly two distinct positive factors.':'Look for exact factor pairs beyond one times the number.',explanation:step===0?`${n} has exactly two positive factors, 1 and ${n}.`:step===1?`${n} has another factor pair: ${n===25?'5 × 5':`3 × ${n/3}`}.`:'One has only one positive factor, so it is neither prime nor composite.',why:'The number of distinct positive factors determines the category.'});
  }
  if(id==='g4y-times-as-many'){
    const small=[7,8,9][v],copies=[4,3,5][v],large=small*copies,expected=[large,large-small,copies][step];
    return number(expected,step===2?quotient(large,small):area([copies],[small]),{prompt:[`A ribbon is ${copies} times as long as a ${small} cm ribbon. How long is it?`,`How many centimeters longer is ${large} cm than ${small} cm?`,`How many times as long is ${large} cm as ${small} cm?`][step],hint:step===1?'An extra length is found by subtraction.':'The multiplier counts equal copies.',explanation:[`${copies} × ${small} = ${large} cm.`,`${large} − ${small} = ${large-small} cm longer.`,`${large} ÷ ${small} = ${copies} times as long.`][step],why:'A multiplicative comparison and an additive difference answer different questions.'},60);
  }
  if(id==='g4y-pattern-rule'){
    const start=[2,1,4][v],hop=[3,4,5][v];
    if(step===2)return pick(hop%2?'alternate':'same',[opt('alternate','Odd and even alternate'),opt('same','Every term stays odd'),opt('even','Every term is even')],{prompt:`Start at ${start} and keep adding ${hop}. What parity pattern follows?`,visual:{type:'number-line',min:0,max:30,start,end:start+4*hop,tickStep:1,moves:[hop,hop,hop,hop]},hint:'An odd hop changes parity; an even hop keeps parity.',explanation:hop%2?'Adding an odd number changes odd to even or even to odd each time.':'Starting odd and adding an even number keeps every term odd.',why:'A structural feature can follow from a rule even when it was not stated.'});
    const expected=start+(step===0?3:4)*hop;return number(expected,place(expected-hop),{prompt:step===0?`Continue ${start}, ${start+hop}, ${start+2*hop}, ?. Keep adding ${hop}.`:`What is the fifth term when the first term is ${start} and each hop adds ${hop}?`,hint:'The first term needs zero hops; the fifth term needs four.',explanation:`After ${step===0?3:4} hops, ${start} + ${step===0?3:4} × ${hop} = ${expected}.`,why:'The starting term and the constant rule determine every later term.'},40);
  }
  if(id==='g4y-equivalent-parts'){
    const n=[2,3,2][v],d=[3,4,5][v],visual=bars([[n,d,'Original'],[n*2,d*2,'Each piece split in two']],1,d*2);
    if(step===0)return selectNumber(n*2,visual,{prompt:`Rename ${n}/${d} with denominator ${d*2}. What numerator is needed?`,hint:'Each selected part splits into two selected pieces.',explanation:`${n}/${d} = ${n*2}/${d*2}.`,why:'Splitting all pieces equally changes their count and size while preserving the selected amount.'});
    if(step===1)return pick('equal',[opt('equal','Equal amounts'),opt('larger','The second is larger'),opt('smaller','The second is smaller')],{prompt:'Compare the two fraction names in these matching wholes.',visual,hint:'The selected lengths end at the same position.',explanation:`${n}/${d} and ${n*2}/${d*2} name the same number.`,why:'Equivalence compares amounts rather than the digit sizes.'});
    return fraction(n,d,visual,{prompt:`Build the amount named by ${n*2}/${d*2}.`,hint:'Use the same whole and match the selected length.',explanation:`${n*2}/${d*2} = ${n}/${d}.`,why:'A fraction can have several exact names.'},1);
  }
  if(id==='g4y-compare-fractions'){
    const pairSets=[[[2,3],[3,4]],[[3,5],[2,3]],[[3,4],[5,6]]],base=pairSets[v],pair=step===0?base:step===1?[base[1],base[0]]:[[3,4],[6,8]],[[a,b],[c,d]]=pair,comparison=a*d<c*b?'less':a*d>c*b?'greater':'equal';
    return pick(comparison,[opt('less','Less than <'),opt('equal','Equal to ='),opt('greater','Greater than >')],{prompt:`Compare ${a}/${b} with ${c}/${d} using the same whole.`,visual:bars([[a,b,'First'],[c,d,'Second']],1),hint:'Use matching whole lengths and compare the selected amounts.',explanation:`${a}/${b} ${comparison==='less'?'<':comparison==='greater'?'>':'='} ${c}/${d}.`,why:'Fraction comparisons require the same whole; piece counts alone do not decide them.'});
  }
  if(id==='g4y-join-fractions'){
    const d=[8,6,10][v],a=[3,2,3][v],b=[2,3,4][v],n=[a+b,b,a+b+1][step];
    return fraction(n,d,bars([[a,d,'First share'],[b,d,'Second share']],1),{prompt:[`Join ${a}/${d} and ${b}/${d}. Build their sum.`,`From ${a+b}/${d}, take away ${a}/${d}. Build the remaining share.`,`Add one more ${1}/${d} to ${a+b}/${d}. Build the new share.`][step],hint:'Count selected pieces while keeping their denominator-sized unit.',explanation:[`${a}/${d} + ${b}/${d} = ${a+b}/${d}.`,`${a+b}/${d} − ${a}/${d} = ${b}/${d}.`,`${a+b}/${d} + 1/${d} = ${a+b+1}/${d}.`][step],why:'Joining or separating matching fractional units changes the numerator, not their size.'},2);
  }
  if(id==='g4y-mixed-parts'){
    const d=[4,3,6][v],a=d+1,b=[2,2,3][v],n=step===1?a+b:a;
    return fraction(n,d,bars([[a,d,'One whole and an extra unit'],[b,d,'Additional pieces']],3),{prompt:[`Build one whole and one ${d===4?'quarter':d===3?'third':'sixth'} as a fraction amount.`,`Join ${a}/${d} and ${b}/${d}. Build the sum.`,`From ${a+b}/${d}, remove ${b}/${d}. Build what remains.`][step],hint:`One whole contains ${d} pieces of size 1/${d}.`,explanation:[`1 + 1/${d} = ${a}/${d}.`,`${a}/${d} + ${b}/${d} = ${a+b}/${d}.`,`${a+b}/${d} − ${b}/${d} = ${a}/${d}.`][step],why:'Mixed numbers and improper fractions count the same unit pieces.'});
  }
  if(id==='g4y-fraction-times'){
    const groups=[3,4,3][v],d=[4,6,5][v],piece=[2,2,3][v],n=step===0?groups:step===1?groups*piece:(groups+1)*piece;
    return fraction(n,d,bars([[step===0?1:piece,d,'One copy']],1),{prompt:[`Build ${groups} copies of 1/${d}.`,`Build ${groups} copies of ${piece}/${d}.`,`One more equal copy joins. Build ${(groups+1)} copies of ${piece}/${d}.`][step],hint:'Multiply the selected piece count by the number of copies.',explanation:`${step===2?groups+1:groups} × ${step===0?1:piece}/${d} = ${n}/${d}.`,why:'A whole-number factor counts copies of the same fractional amount.'});
  }
  if(id==='g4y-fraction-story'){
    const copies=[3,4,5][v],n=[2,1,2][v],d=[8,3,6][v],total=copies*n;
    if(step<2)return fraction((copies+step)*n,d,bars([[n,d,'Ribbon for one kite']],1),{prompt:`${copies+step} kites each need ${n}/${d} m of ribbon. Build the total meters.`,hint:'Count an equal fractional ribbon length for every kite.',explanation:`${copies+step} × ${n}/${d} m = ${(copies+step)*n}/${d} m.`,why:'Equal fractional lengths add even when the total passes one whole.'});
    return pick(total<d?'0to1':'1to2',[opt('0to1','Between zero and one meter'),opt('1to2','Between one and two meters'),opt('2to3','Between two and three meters')],{prompt:`Estimate the original ${copies} kites’ total ${total}/${d} m. Which interval contains it?`,visual:bars([[total,d,'Total ribbon']],2),hint:'Compare the selected pieces with the denominator count for one whole.',explanation:`${total}/${d} m is between ${total<d?'0 and 1':'1 and 2'} meters.`,why:'A whole-number benchmark helps check whether a fractional result is reasonable.'});
  }
  if(id==='g4y-tenths-hundredths'){
    const t=[3,6,8][v],h=[7,4,9][v];
    if(step===0)return selectNumber(t*10,grid(t/10),{prompt:`${t}/10 equals how many hundredths?`,hint:'Each tenth contains ten hundredths.',explanation:`${t}/10 = ${t*10}/100.`,why:'Equal subdivision preserves the amount of the same whole.'});
    const expected=step===1?t/10:(t*10+h)/100;
    return number(expected,grid(t/10),{prompt:step===1?`Build the decimal amount named by ${t}/10.`:`Combine ${t}/10 and ${h}/100. Build the decimal total.`,hint:step===1?'Use the tenths place.':`Rename ${t}/10 as ${t*10}/100 first.`,explanation:step===1?`${t}/10 = ${expected}.`:`${t*10}/100 + ${h}/100 = ${t*10+h}/100 = ${expected}.`,why:'Tenths and hundredths can use matching fractional units before they join.'},1,.01);
  }
  if(id==='g4y-decimal-order'){
    const a=[.4,.7,.6][v],b=[.35,.65,.58][v],c=[.37,.64,.59][v],left=step===1?a:step===2?c:a,right=step===1?a:step===2?a:b,expected=left<right?'less':left>right?'greater':'equal';
    return pick(expected,[opt('less','Less than <'),opt('equal','Equal to ='),opt('greater','Greater than >')],{prompt:`Compare ${step===1?a.toFixed(2):left} with ${right}.`,visual:bars([[Math.round(left*100),100,'First'],[Math.round(right*100),100,'Second']],1,100),hint:'Rename both amounts as hundredths of the same whole.',explanation:`${left.toFixed(2)} ${expected==='less'?'<':expected==='greater'?'>':'='} ${right.toFixed(2)}.`,why:'A trailing decimal zero does not change value, and more written digits do not necessarily mean more.'});
  }
  if(id==='g4y-unit-conversions'){
    const amount=[3+v,2+v,2+v][step],factor=[100,1000,60][step],from=['m','kg','hours'][step],to=['cm','g','minutes'][step],expected=amount*factor;
    return selectNumber(expected,convert(amount,from,to,factor),{prompt:`Convert ${amount} ${from} to ${to}.`,hint:`One ${from==='hours'?'hour':from} contains ${factor} ${to}.`,explanation:`${amount} × ${factor} = ${expected} ${to}.`,why:'A smaller unit needs more equal units to describe the same amount.',unit:to});
  }
  if(id==='g4y-measurement-story'){
    const liters=[2,3,4][v],first=[250,400,750][v],second=1000-first,expected=[liters*1000,1000,(liters+1)*1000][step];
    return number(expected,convert(step===1?1:liters,'L','mL',1000),{prompt:[`A picnic jug holds ${liters} L. How many mL is that?`,`Two extra portions hold ${first} mL and ${second} mL. How many mL do they add?`,`Combine ${liters} L, ${first} mL, and ${second} mL. How many mL altogether?`][step],hint:'Convert liters to milliliters, then keep every amount in mL.',explanation:[`${liters} L = ${liters*1000} mL.`,`${first} + ${second} = 1000 mL.`,`${liters*1000} + 1000 = ${(liters+1)*1000} mL.`][step],why:'Combining measurements requires compatible units.',unit:'mL'},6000,50);
  }
  if(id==='g4y-fraction-plot'){
    const values=[[.5,.75,.75,1],[.25,.5,.5,1],[.75,.75,1,1.25]][v],expected=step===0?4:step===1?Math.max(...values)-Math.min(...values):values.reduce((a,b)=>a+b,0),visual={type:'data',kind:'line-plot',values,min:0,max:1.5,tickStep:.25,fractionDenominator:4,unit:'m',title:'Measured kite ribbons'};
    const options=step===0?[opt(4),opt(3),opt(5)]:[opt(String(expected),quarterName(expected)),opt(String(expected+.25),quarterName(expected+.25)),opt(String(expected+.5),quarterName(expected+.5))];
    return pick(String(expected),options,{prompt:['How many ribbons were measured?','How much longer is the longest ribbon than the shortest?','What is the combined length of all four ribbons?'][step],visual,hint:step===0?'Each X is one ribbon.':step===1?'Subtract the shortest measurement from the longest.':'Add all four measured lengths, including repeated lengths.',explanation:step===0?'Four marks represent four measured ribbons.':step===1?`The difference is ${quarterName(expected)} m.`:`The lengths add to ${quarterName(expected)} m.`,why:'Counting marks, comparing lengths, and adding lengths are different questions.'});
  }
  if(id==='g4y-area-perimeter'){
    const length=[8,9,10][v],width=[5,4,6][v],expected=[length*width,2*(length+width),width][step];
    return number(expected,area([width],[length]),{prompt:[`A garden is ${length} m by ${width} m. What is its area in square meters?`,`What is the perimeter of the same ${length}-by-${width} garden, in meters?`,`A rectangle covers ${length*width} square meters with length ${length} m. Find its width.`][step],hint:step===0?'Covering uses length × width.':step===1?'Follow all four outside sides once.':'Find the missing factor in length × width = area.',explanation:[`${length} × ${width} = ${length*width} square meters.`,`2 × (${length} + ${width}) = ${2*(length+width)} meters.`,`${length*width} ÷ ${length} = ${width} meters.`][step],why:'Area measures covering; perimeter measures the boundary. Their units differ.'},100);
  }
  if(id==='g4y-angle-tool'){
    const degrees=[40,65,120][v];
    if(step===1)return pick(degrees<90?'acute':'obtuse',[opt('acute','Acute'),opt('right','Right'),opt('obtuse','Obtuse')],{prompt:'Classify the measured angle by its opening.',visual:angle(degrees,true),hint:'Acute is below 90°; obtuse is above 90° and below 180°.',explanation:`${degrees}° is ${degrees<90?'acute':'obtuse'}.`,why:'Angle categories depend on the turn, not the ray lengths.'});
    const full=degrees<90?90:180,expected=step===0?degrees:full-degrees;
    return number(expected,step===0?angle(degrees):angle(full,true,{splitAt:degrees}),{prompt:step===0?'Read the given angle. Build a trial with the same number of degrees.':`A ${full}° angle has one part of ${degrees}°. Build the missing angle part.`,hint:step===0?'Begin at the zero ray and follow the correct protractor scale.':`Find ${full} − ${degrees}.`,explanation:step===0?`The angle measures ${degrees}°.`:`${degrees}° + ${expected}° = ${full}°.`,why:'Adjacent non-overlapping angle measures add to the whole turn.',unit:'degrees'},180,5);
  }
  if(id==='g4y-line-properties'){
    const modes=['parallel','perpendicular','intersecting'],mode=modes[(v+step)%3];
    if(step===2)return selectNumber(2,polygons(['rectangle']),{prompt:'How many pairs of parallel opposite sides does this rectangle have?',hint:'Each of the two directions has a pair of opposite sides.',explanation:'A rectangle has two pairs of parallel opposite sides.',why:'Line relationships can be recognized inside a shape.'});
    return pick(mode,modes.map(m=>opt(m,m==='intersecting'?'Intersecting, but not perpendicular':m[0].toUpperCase()+m.slice(1))),{prompt:'Which relationship describes these lines?',visual:upper('line-pairs',{mode}),hint:'Look for no meeting, a right-angle meeting, or a different crossing.',explanation:mode==='parallel'?'The distinct coplanar lines stay the same direction and do not meet.':mode==='perpendicular'?'These lines meet at a right angle.':'The lines cross, but their angles are not right angles.',why:'Perpendicular lines are a special kind of intersecting lines.'});
  }
  if(id==='g4y-symmetry-folds'){
    const square=step!==1,visual=upper('symmetry',{shape:square?'square':'rectangle',axes:'all'});
    if(step===2)return pick('yes',[opt('yes','Yes, the halves match'),opt('no','No, equal area is not enough here')],{prompt:'Does a diagonal fold of this square match its two parts?',visual,hint:'A square has equal sides as well as four right angles.',explanation:'Yes. Each diagonal of a square is a reflection symmetry line.',why:'A symmetry line reflects every part of the shape onto a matching part.'});
    return selectNumber(square?4:2,visual,{prompt:`How many lines of reflection symmetry does this ${square?'square':'nonsquare rectangle'} have?`,hint:'Count only lines where a fold would match both parts.',explanation:square?'A square has four: two diagonals and two lines through side midpoints.':'A nonsquare rectangle has two, through opposite side midpoints; its diagonals do not work.',why:'Equal-area halves are not always mirror-image halves.'});
  }
  if(id==='g4y-shape-families'){
    const shape=['right-triangle','acute-triangle','obtuse-triangle'][v];
    if(step===0)return pick(shape,['right-triangle','acute-triangle','obtuse-triangle'].map(s=>opt(s,s.replace('-',' '))),{prompt:'Which angle category describes this triangle?',visual:polygons([shape]),hint:'A right triangle has one right angle; an obtuse triangle has one obtuse angle; an acute triangle has all acute angles.',explanation:`This is an ${shape==='right-triangle'?'angle category called a right triangle':shape.replace('-',' ')}.`,why:'Triangle angle classification follows the largest angle.'});
    if(step===1)return pick('yes',[opt('yes','Yes, it has four right angles'),opt('no','No, a square cannot be a rectangle')],{prompt:'Does the square belong to the rectangle family too?',visual:polygons(['square','rectangle']),hint:'Check the defining rectangle rule rather than its familiar drawing.',explanation:'Yes. A square has four right angles and therefore is also a rectangle.',why:'A specific shape can belong to more than one family.'});
    return pick('two-pairs',[opt('two-pairs','Two pairs of parallel opposite sides'),opt('one-pair','Exactly one parallel pair'),opt('none','No parallel sides')],{prompt:'Which property is shared by these two shapes?',visual:polygons(['parallelogram','rhombus']),hint:'Trace the direction of each pair of opposite sides.',explanation:'Both a parallelogram and a rhombus have two pairs of parallel opposite sides.',why:'Shared defining attributes connect related quadrilateral families.'});
  }
  throw new Error(`Missing original Grade 4 activity: ${id}`);
}
