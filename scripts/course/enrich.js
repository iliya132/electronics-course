import {readFileSync} from 'node:fs';
import yaml from 'js-yaml';
const terms=yaml.load(readFileSync('content/glossary.yml','utf8'));
export function enrich(d,l,t){
 const list=Array.isArray(terms)?terms:terms.terms||[];
 const titles={'capacitor-ratings-esr':'Конденсаторы: напряжение, ESR и срок службы','frequency-response':'АЧХ, децибелы и частота среза','switching-practical':'Практика импульсных преобразователей','power-sequencing-pg':'Последовательность включения и защита питания'};d.title||=titles[l.id];
 d.terms||=list.filter(term=>(d.concept+' '+d.check).toLocaleLowerCase('ru').includes(term.term.toLocaleLowerCase('ru'))).map(t=>t.id);
 const boards={
 'decoupling':'У выводов питания Arduino Uno и ESP32 стоят небольшие керамические конденсаторы: они замыкают быстрые импульсы тока локально.',
 'pullups-resistors-roles':'Подтяжки удерживают RESET на Uno и EN/BOOT на ESP32 в определённом состоянии, пока кнопка отпущена.',
 'linear-regulator':'На Uno R3 линейный регулятор получает внешнее питание. На ESP32 DevKit LDO формирует 3,3 В; проверяй точную ревизию.',
 'ldo':'LDO у ESP32 расположен между входным питанием и шиной 3V3. Его конденсаторы и запас по току влияют на стабильность Wi-Fi.',
 'fuses-ptc':'На оригинальной Uno R3 PTC включён в USB-питание. Защита конкретного клона может отличаться.',
 'reset-boot':'У Uno импульс DTR через конденсатор вызывает сброс; у ESP32 служебные сигналы управляют EN и BOOT.',
 'clock-crystal':'У оригинальной Uno R3 ATmega328P тактируется керамическим резонатором 16 МГц. Кварц USB-контроллера — отдельный узел.',
 'usb-basics':'USB-мост на классических Uno R3 и ESP32 DevKit отдельный от основного МК. В семействах с native USB схема другая.',
 'bjt-switch':'Транзисторные ключи встречаются в схеме автоматической загрузки ESP32. Их роль определяется соединениями DTR/RTS и EN/BOOT.'
 };
 d.board||=boards[l.id];
 if(!d.safety&&t.number>=4&&t.number<=10)d.safety='Собирай без питания и проверяй полярность. Для опыта используй только изолированный низковольтный источник с ограничением тока. Конденсаторы перед перестановкой разряжай через подходящий резистор.';
 const project=t.lessons.find(p=>p.kind==='project'&&!p.optional);
 d.home=project&&project.id!==l.id?project:undefined;
 return d;
}
export function practiceChoice(d){
 return {type:'multi',question:'Выбери все обоснованные действия и выводы для этого узла.',
 options:[d.truth,d.wrong1,d.check,d.wrong2],answer:[0,2],hint:'Отметь два утверждения: физический принцип и способ его проверки.',
 explanation:'Верны физический принцип и описанный способ проверки. '+d.truth+' '+d.check+' Ошибочные предположения противоречат этим условиям: '+d.wrong1+'; '+d.wrong2+'.'};
}

