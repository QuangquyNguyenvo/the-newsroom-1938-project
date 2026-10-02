// Fictional life stories and dialogue, never archival quotations or puzzle evidence.
import { readers } from './readers.js';
const beat = (title, scene, lines, questions, reflection) => ({
  title,
  scene,
  lines,
  questions,
  reflection,
});
const ask = (label, speaker, text) => ({ label, speaker, text });
export const storyStages = ['Lời gửi đầu tiên', 'Sau một bản tin', 'Những ngày chờ tin'];
export const sideStories = [
  {
    id: 'cloth',
    photo: {
      src: 'assets/stories/cloth.jpg',
      credit: 'Cooper Hewitt, Smithsonian Design Museum · phạm vi công cộng',
    },
    station: 'desk',
    label: 'Mảnh vải vá',
    reader: 'tu',
    related: 'copybook',
    sound: 'paper',
    arrival:
      'Út mang phần vải thừa chị Tư gửi để lau bàn. Trên đó còn đường chị khâu thử trước khi vá áo con.',
    scenes: [
      beat(
        'Đường vá không thẳng',
        'Út kể chị Tư tháo đường chỉ cũ trên áo con rồi vá bằng một mảnh vải cùng loại. Chị làm chậm vì con cứ hỏi bao giờ được mặc áo mới. Đến sáng, chị lại đi dệt những tấm vải sẽ không thuộc về mình.',
        [
          [
            'Chị Tư',
            'Nó hỏi sao má làm vải mà áo mình cứ vá hoài. Tôi bảo vá còn mặc được. Nói xong mới thấy mình chưa trả lời nó.',
          ],
          ['Út', 'Chị giữ phần vải tốt nhất cho tay áo, chỗ con hay kéo khi muốn nói chuyện.'],
        ],
        [
          ask(
            'Chị đã trả lời con thế nào?',
            'Chị Tư',
            'Tôi kể hồi nhỏ cũng mặc áo chị mình để lại. Nó nghe, nhưng vẫn nhìn cái tay áo. Có những chuyện người lớn kể không làm trẻ con hết buồn.',
          ),
          ask(
            'Người cùng làm có biết chuyện này?',
            'Chị Tư',
            'Có chị cho tôi sợi chỉ. Chị khác chỉ cách giấu đường vá. Chúng tôi giúp nhau, nhưng chẳng ai có dư để giải quyết hết chuyện của người kia.',
          ),
        ],
        'Mình cần viết rõ một ngày của người thợ, thay vì chỉ đặt chữ cơm áo lên trang báo.',
      ),
      beat(
        'Một lời nhờ chưa được đồng ý',
        'Sau khi nghe bản tin, chị Tư hỏi người cùng làm có muốn kể chuyện tiền công không. Một người gật đầu rồi hôm sau đổi ý. Chị Tư gửi thêm lời nhắn: đừng viết tên người ấy. Út đã gạch tên khỏi bản chép.',
        [
          [
            'Chị Tư',
            'Bữa trước chị ấy kể lúc mệt quá. Bữa sau nghĩ lại, chị ấy sợ. Kể cho tôi nghe đâu có nghĩa là muốn cả phố biết.',
          ],
          [
            'Út',
            'Em định nói có người kể thật thì bài mới đáng tin. Chị bảo đáng tin cũng phải giữ lời với người ta.',
          ],
        ],
        [
          ask(
            'Bỏ tên rồi còn kể được gì?',
            'Chị Tư',
            'Hỏi lại chị ấy đã. Có thể kể chuyện của tôi trước. Người ta không muốn nói thì đừng lấy điều tôi nghe riêng làm phần của mình.',
          ),
          ask(
            'Chị có thấy khó xử không?',
            'Chị Tư',
            'Có. Tôi muốn bài nói đủ chuyện, nhưng không muốn người cùng làm tránh mặt mình. Ngày mai chúng tôi vẫn phải ngồi cạnh nhau.',
          ),
        ],
        'Mình đã nhận lời lắng nghe. Điều đó còn có nghĩa là biết dừng khi người kể chưa sẵn lòng.',
      ),
      beat(
        'Đừng viết tôi thành người khác',
        'Năm đọc cho chị Tư một đoạn diễn ý lại lời chị bằng những chữ trang trọng. Chị nhận ra chuyện của mình nhưng không nhận ra giọng mình. Cậu đặt bút xuống, chờ chị kể lại từ đầu.',
        [
          [
            'Chị Tư',
            'Cậu viết hay quá, nhưng tôi kể lại cho mấy chị thì không nói được vậy. Đừng viết tôi thành người giỏi chữ hơn tôi.',
          ],
          [
            'Năm',
            'Con sửa ít thôi. Chỗ nào chưa hiểu, con để lại câu hỏi, không tự làm cho nó nghe hay.',
          ],
        ],
        [
          ask(
            'Chị muốn giữ câu nào?',
            'Chị Tư',
            'Giữ câu đong gạo. Tôi nhìn cái lon gạo mỗi tối, đâu có nhìn những chữ lớn trên báo. Người cùng làm nghe câu ấy là hiểu.',
          ),
          ask(
            'Điều gì đã thay đổi sau khi gửi thư?',
            'Chị Tư',
            'Có người hỏi tôi kể tiếp. Trước đó người ta hay bảo tôi đừng nghĩ nhiều. Nhưng tiền công vẫn vậy, đừng viết như một lá thư là mọi chuyện đã khá lên.',
          ),
        ],
        'Một bản tin cần giữ được giọng người kể, cả những điều nó chưa giúp được.',
      ),
    ],
    ending:
      'Mảnh vải được dùng để lau bàn sau buổi in. Mình giữ lại ghi chép về đường vá. Nó nhắc mình rằng cuộc sống của chị Tư vẫn tiếp tục sau đoạn kết trên báo.',
  },
  {
    id: 'copybook',
    station: 'desk',
    label: 'Tập chữ của Út',
    reader: 'tu',
    related: 'questionbook',
    sound: 'book',
    arrival:
      'Út để lại một tập chép. Trang đầu là những chữ chị Tư đang học, trang sau là những chỗ em chưa biết giải thích.',
    scenes: [
      beat(
        'Chữ đầu tiên là tên mình',
        'Út chép lại những dòng chị Tư tập viết để gửi cùng lá thư. Chữ T nghiêng nhiều lần. Chị giấu trang viết xuống dưới khi con lại gần, rồi chính tay kéo nó ra cho con nhìn.',
        [
          [
            'Chị Tư',
            'Nó hỏi má cũng đi học hả. Tôi thấy mắc cỡ, rồi nghĩ mắc cỡ thì mai lại cất tập mất.',
          ],
          ['Út', 'Em quen đọc hộ nên cứ đọc nhanh. Bữa đó chị chặn tay em: chỉ từng chữ thôi.'],
        ],
        [
          ask(
            'Vì sao chị chọn viết tên trước?',
            'Chị Tư',
            'Tôi muốn có một chữ không phải nhờ người khác viết hộ. Khi gửi lời lên báo, tôi còn nhận ra tên mình ở cuối.',
          ),
          ask(
            'Út đã giúp chị ra sao?',
            'Út',
            'Em phải ngồi chờ chị viết, thay vì làm giùm cho lẹ. Có lúc em sốt ruột. Chị nhận ra ngay, bảo hôm khác học cũng được. Em mới biết mình đang làm chị ngại thêm.',
          ),
        ],
        'Mình không thể lấy việc đọc được của mình làm nhịp cho người khác.',
      ),
      beat(
        'Một chữ nghe khác nhau',
        'Bản tin được đọc lại ở dãy trọ. Chị Tư hỏi dân chủ là gì. Út định đọc nguyên câu giải thích; anh Ba hỏi nếu ai có điều muốn nói mà không được nghe thì sao. Cả ba ngừng ở câu hỏi ấy lâu hơn ở đoạn báo.',
        [
          ['Chị Tư', 'Tôi nói mà người ta chỉ nghe phần họ thích thì có tính là được nói không?'],
          [
            'Anh Ba',
            'Chuyện chủ xe kể, trước đây tôi cũng chỉ nghe rồi gật. Tôi chưa biết hết, nhưng câu hỏi của chị không phải chuyện nhỏ.',
          ],
        ],
        [
          ask(
            'Út có trả lời ngay không?',
            'Út',
            'Không. Em biết mặt chữ nhưng chưa biết giải thích cho tới nơi. Em ghi câu hỏi lại, để lần sau hỏi người hiểu hơn.',
          ),
          ask(
            'Chị Tư có bỏ buổi học không?',
            'Chị Tư',
            'Có tối mệt quá thì nghỉ. Tôi học chậm, không phải vì không muốn. Sáng vẫn phải dậy làm. Đừng khen rồi đòi tôi ngày nào cũng giỏi thêm.',
          ),
        ],
        'Mình sẽ giữ chỗ cho câu hỏi chưa có lời giải, không dùng lời dễ hiểu để làm chuyện khó thành quá đơn giản.',
      ),
      beat(
        'Buổi tối Út về muộn',
        'Út nhận thêm việc nên có tối không về kịp. Chị Tư tưởng mình lại phải chờ. Năm mang tập sang đọc cùng, nhưng cậu cũng có bài chưa làm. Hai người hẹn đọc một đoạn ngắn rồi ai làm việc nấy.',
        [
          ['Năm', 'Con đọc hết trang này thôi. Ngày mai con bị hỏi bài, con cũng sợ chứ.'],
          [
            'Chị Tư',
            'Vậy cậu học đi. Câu nào tôi nhận ra thì tôi tự dò. Mai cậu nghe xem tôi đọc có đúng không.',
          ],
        ],
        [
          ask(
            'Buổi đọc ngắn có đủ không?',
            'Chị Tư',
            'Đủ cho tối nay. Trước tôi cứ nghĩ phải có người rảnh cả buổi mới học được. Giờ một dòng cũng là một dòng.',
          ),
          ask(
            'Út nghĩ gì khi biết chị tự dò chữ?',
            'Út',
            'Em vui, rồi hơi buồn vì tưởng chị không cần mình nữa. Chị bảo vẫn cần em, chỉ là không phải chuyện gì cũng làm hộ. Em chưa quen nghe vậy.',
          ),
        ],
        'Giúp một người tự làm được không có nghĩa là họ thôi cần người bên cạnh.',
      ),
    ],
    ending:
      'Trang chép cuối vẫn có những chữ bỏ trống. Chị Tư đã hẹn Năm một buổi đọc khác. Mình giữ khoảng trống ấy, không sửa thành một cái kết chị đã biết đọc hết.',
  },
  {
    id: 'rent-slip',
    station: 'shelf',
    label: 'Sổ tiền thuê xe',
    reader: 'ba',
    related: 'sandal',
    sound: 'book',
    arrival:
      'Anh Ba gửi bản chép một trang sổ tiền xe. Ở góc giấy có khoản dành dụm bị gạch rồi ghi lại.',
    scenes: [
      beat(
        'Chiếc xe chưa thuộc về mình',
        'Anh Ba ghi tiền thuê xe trước tiền ăn. Có ngày mưa, không kéo đủ tiền vẫn phải tính khoản thuê. Cuối trang anh viết mua xe riêng, rồi chừa một cột trống. Anh không muốn ai đọc lá thư rồi nghĩ mình chỉ biết chịu đựng.',
        [
          [
            'Anh Ba',
            'Tôi có tính chứ. Chỉ là lần nào tính xong cũng có việc khác phải chi. Dự định nhỏ dần, không phải vì tôi hết muốn.',
          ],
          [
            'Út',
            'Anh không gửi cả cuốn sổ. Anh chép một trang, bảo đừng để chuyện riêng của người cùng trọ lên báo.',
          ],
        ],
        [
          ask(
            'Anh còn muốn mua xe riêng không?',
            'Anh Ba',
            'Còn. Nhưng tôi muốn có tiền chữa bệnh trước nếu nằm xuống vài ngày. Có chiếc xe mà không có sức kéo thì cũng không giải quyết hết.',
          ),
          ask(
            'Anh muốn báo nhìn thấy điều gì?',
            'Anh Ba',
            'Nhìn thấy khoản tiền phải trả trước khi có khách. Đừng chỉ kể tôi thức sớm, chịu khó. Tôi đã chịu khó nhiều năm rồi.',
          ),
        ],
        'Mình cần nhìn khoản tiền anh phải trả trước khi hỏi vì sao anh chưa đổi được đời mình.',
      ),
      beat(
        'Lời dọa và lời đã kiểm chứng',
        'Anh Ba đọc phần đối chiếu về tờ báo, rồi gặp lại chủ xe. Anh chuẩn bị nhiều câu nhưng cuối cùng chỉ hỏi một câu ngắn. Người kia không trả lời, chỉ nhắc tiền thuê ngày mai. Tối ấy anh mang chuyện về kể, không nói mình đã thắng.',
        [
          [
            'Anh Ba',
            'Biết rõ lời mình nói không làm tôi hết run. Ông ấy có thể không trả lời, còn tôi vẫn phải quay lại lấy xe.',
          ],
          [
            'Chị Tư',
            'Anh hỏi được đã là việc của anh. Đừng vì người ta không trả lời mà tự bảo mình hỏi sai.',
          ],
        ],
        [
          ask(
            'Anh có định hỏi tiếp không?',
            'Anh Ba',
            'Tôi chưa biết lúc nào. Tôi phải tính cả chuyện ngày mai ăn gì. Người nghe không ở chỗ tôi thì dễ bảo cứ nói đi.',
          ),
          ask(
            'Anh kể gì với người cùng trọ?',
            'Anh Ba',
            'Tôi kể đủ cả đoạn mình im. Nếu chỉ kể câu đã chuẩn bị thì nghe như tôi gan lắm. Út bảo đoạn im cũng làm người ta hiểu chuyện hơn.',
          ),
        ],
        'Một người hiểu sự thật vẫn có thể sợ. Mình sẽ không viết sự can đảm như điều ai cũng phải làm được ngay.',
      ),
      beat(
        'Trang sổ có thêm người đọc',
        'Khi nghe những tin trái ngược về việc ra báo, anh Ba muốn bỏ mấy tờ cũ để khỏi bị hỏi. Nhưng Năm còn ghi câu hỏi ở lề. Anh giữ chúng lại, dặn cậu nhớ rằng một tờ báo cũ không trả lời được mọi chuyện đang xảy ra hôm nay.',
        [
          [
            'Anh Ba',
            'Chỗ nào có ngày tháng thì giữ nguyên ngày tháng. Đừng đọc chuyện cũ rồi kể như tin vừa xảy ra.',
          ],
          ['Năm', 'Con ghi ngày bên cạnh. Còn điều mới chưa rõ, con viết chưa biết.'],
        ],
        [
          ask(
            'Anh đã hết tin lời đồn chưa?',
            'Anh Ba',
            'Chưa. Có lúc lo quá, nghe ai nói chắc là muốn tin ngay. Tôi phải nhắc mình hỏi họ biết từ đâu. Đó là việc làm lại mỗi lần, không phải học một lần là xong.',
          ),
          ask(
            'Tại sao anh giao báo cho Năm?',
            'Anh Ba',
            'Cậu giữ kỹ hơn tôi, nhưng không phải tôi đẩy hết việc cho cậu. Tôi vẫn mang tin về, chỉ kể rõ điều tận mắt thấy và điều nghe người khác nói.',
          ),
        ],
        'Mình sẽ ghi cả thời điểm và điều chưa biết. Một thông tin đúng có thể bị dùng sai khi mất bối cảnh.',
      ),
    ],
    ending:
      'Cột mua xe riêng vẫn chưa có tổng tiền đủ. Anh Ba để dành thêm một chỗ trong sổ cho điều cần kiểm tra. Mình đã nghe được một dự định, không chỉ một nỗi khổ.',
  },
  {
    id: 'sandal',
    photo: {
      src: 'assets/stories/sandal.jpg',
      credit: 'Auckland War Memorial Museum · CC BY 4.0',
    },
    station: 'shelf',
    label: 'Quai dép và sợi chỉ',
    reader: 'ba',
    related: 'cloth',
    sound: 'wood',
    arrival:
      'Anh Ba để lại đoạn quai dép cũ sau lúc nhờ vá tạm. Bên cạnh là mẩu giấy Út ghi câu chuyện của anh.',
    scenes: [
      beat(
        'Buổi đứng chờ khách',
        'Quai dép đứt khi anh Ba đang kéo xe. Anh buộc lại, nhưng đến chỗ đợi khách thì bàn chân đau. Người khách nhìn anh rồi chọn xe khác. Tối ấy, anh nói mình mất một cuốc; Út nghe ra anh còn mất cảm giác được nhìn như một người làm nghề.',
        [
          [
            'Anh Ba',
            'Tôi hiểu khách muốn đi cho yên. Nhưng họ nhìn cái dép rồi nhìn qua tôi, như tôi cũng chỉ là thứ sắp hỏng.',
          ],
          [
            'Út',
            'Em định nói mua đôi khác đi. Nói tới đó mới nhớ em đâu biết hôm nay anh có đủ tiền không.',
          ],
        ],
        [
          ask(
            'Anh có giận người khách không?',
            'Anh Ba',
            'Có lúc có. Rồi tôi nghĩ chắc họ không biết. Nhưng không biết cũng không làm câu chuyện nhẹ đi. Tôi muốn kể mà không biến họ thành người ác cho dễ viết.',
          ),
          ask(
            'Anh làm gì khi về trọ?',
            'Anh Ba',
            'Vá cho sáng mai đi được. Chị Tư đưa chỉ, Năm giữ đèn. Chúng tôi bàn chuyện khác, vì tôi không muốn cả tối ai cũng nhìn chân mình.',
          ),
        ],
        'Mình không cần một người xấu đơn giản để viết được điều làm anh tổn thương.',
      ),
      beat(
        'Tờ báo đi qua nhiều tay',
        'Anh Ba mang tờ báo về. Chị Tư giữ mép giấy vì tay cậu Năm dính nước giặt. Út đọc, nhưng đọc nhanh khiến người nghe bỏ lỡ. Anh Ba ngắt lời: chờ đã, đoạn trước còn người chưa hiểu. Lần đầu anh đứng về phía người nghe thay vì giục đọc hết.',
        [
          [
            'Anh Ba',
            'Mang được báo về chưa phải là xong. Nếu người nghe chỉ gật cho qua thì tờ giấy vẫn chưa tới họ.',
          ],
          ['Út', 'Em thấy mình bị sửa nên hơi bực. Nhưng chị Tư hỏi lại đúng chỗ em đã lướt qua.'],
        ],
        [
          ask(
            'Đọc chậm có gây khó chịu không?',
            'Anh Ba',
            'Có người muốn nghe tiếp, có người phải về nấu cơm. Chúng tôi hẹn đoạn còn lại. Không phải ai chậm cũng cần người khác đứng chờ cả tối.',
          ),
          ask(
            'Ai giữ tờ báo sau buổi đọc?',
            'Anh Ba',
            'Chị Tư giữ một đêm. Mai tôi lấy lại đưa người khác. Mỗi lần chuyền phải nhớ hỏi họ đọc xong chưa, đừng coi tờ báo là phần của riêng mình.',
          ),
        ],
        'Người mang báo, người đọc và người nghe cùng làm nên một cuộc đọc. Mình viết cho cả ba.',
      ),
      beat(
        'Một lần không mang tin về',
        'Anh Ba về trọ tay không. Năm hỏi ngay có tin mới chưa. Anh gắt lên rồi im. Sáng hôm sau anh xin lỗi, nói có ngày mình chỉ đủ sức về đến nhà. Năm cũng nhận ra mỗi lần anh về, mình đều hỏi tờ báo trước khi hỏi anh.',
        [
          [
            'Anh Ba',
            'Tôi không muốn cứ bước vào là phải có tin cho mọi người. Có hôm tôi chẳng có gì, chỉ có cái lưng đau.',
          ],
          ['Năm', 'Con hỏi anh ăn chưa trước. Chuyện báo để sau cũng được.'],
        ],
        [
          ask(
            'Anh Ba có thôi mang báo không?',
            'Anh Ba',
            'Không. Tôi chỉ muốn được có hôm không mang. Việc mình làm vì muốn giúp, làm riết rồi người khác chờ như bổn phận, khó nói lắm.',
          ),
          ask(
            'Năm đã làm gì sau lời xin lỗi?',
            'Năm',
            'Con trả lại tờ cũ đã đọc, không xin tờ khác ngay. Con vẫn muốn biết tin, nhưng con không muốn anh phải kiếm cho con khi anh đang mệt.',
          ),
        ],
        'Mình sẽ nhớ người chuyển tin còn có một ngày sống riêng. Không ai chỉ tồn tại để giúp trang báo đi xa.',
      ),
    ],
    ending:
      'Đoạn quai cũ không được gắn lại. Anh Ba đã vá một quai khác. Mình giữ lời kể về lần anh về tay không, để nhớ một người có quyền mệt và có quyền nói chưa giúp được hôm nay.',
  },
  {
    id: 'coinbox',
    photo: {
      src: 'assets/stories/coinbox.jpg',
      credit: 'Phủ Toàn quyền Đông Dương / MA-Shops · phạm vi công cộng',
    },
    station: 'press',
    label: 'Hộp xu mua tập',
    reader: 'nam',
    related: 'questionbook',
    sound: 'click',
    arrival:
      'Hộp gỗ nhỏ gợi khoản xu Năm dành dụm và lời dặn giúp người khác vừa sức. Đây là đồ vật minh họa cho câu chuyện hư cấu, không phải khoản quyên góp ghi trong tư liệu.',
    scenes: [
      beat(
        'Mẹ hỏi cuốn tập đâu',
        'Trước những lá thư hỏi tin, Năm đã tính để dành tiền mua tập. Cậu nói với mẹ muốn dùng một phần giúp việc đọc báo ở dãy trọ. Mẹ không mắng, chỉ hỏi nếu hết giấy thì cậu sẽ làm bài ở đâu. Câu hỏi khiến cậu phải đếm lại tiền.',
        [
          [
            'Mẹ Năm',
            'Muốn giúp người ta thì tốt. Nhưng con nói muốn học làm thầy, việc học của con cũng cần được lo.',
          ],
          [
            'Năm',
            'Con tưởng giữ tiền cho mình là ích kỷ. Mẹ hỏi vậy, con không biết trả lời ngay.',
          ],
        ],
        [
          ask(
            'Năm đã giữ lại bao nhiêu?',
            'Năm',
            'Con giữ phần cần cho tập, phần có thể dành mới gửi. Con không muốn lấy chuyện cho hết làm điều hay để kể rồi ngày mai lại xin mẹ.',
          ),
          ask(
            'Cậu có ngại góp ít không?',
            'Năm',
            'Có. Con định không ghi tên. Sau con nghĩ nếu hỏi tin thì người ta cần biết hồi âm cho ai. Con gửi ít, nhưng câu hỏi của con không ít hơn.',
          ),
        ],
        'Mình không nên khen một đứa trẻ vì bỏ phần cần dùng. Lời hỏi của em cũng xứng đáng được trả lời.',
      ),
      beat(
        'Bài tập bỏ dở',
        'Năm đọc giúp chị Tư rồi về làm bài quá muộn. Hôm sau cậu không trả lời được câu hỏi ở lớp. Cậu giấu cuốn tập, định nói mình mệt. Tối ấy, cậu kể thật với chị Tư. Chị đóng tờ báo lại trước khi cậu kịp đọc.',
        [
          [
            'Năm',
            'Con muốn mọi người gọi lúc cần đọc. Được cần tới làm con vui, nên con hay nhận cả khi chưa học xong.',
          ],
          [
            'Chị Tư',
            'Cậu học trước đi. Tôi chờ được. Đừng làm như chỉ có việc của người khác mới quan trọng.',
          ],
        ],
        [
          ask(
            'Năm có thất vọng không?',
            'Năm',
            'Có chút. Con tưởng chị sẽ khen đã giúp. Nhưng chị nhớ con còn là học trò. Lúc về con vừa nhẹ người vừa thấy mình trẻ con.',
          ),
          ask(
            'Họ hẹn buổi đọc thế nào?',
            'Chị Tư',
            'Hẹn một đoạn, sau giờ cậu học. Tôi cũng có hôm bận. Hẹn rõ thì không ai phải đoán người kia đang mong mình làm gì.',
          ),
        ],
        'Một lời giúp có thể đi cùng giới hạn. Mình muốn hồi âm nói rõ điều đó, thay vì đòi em cố hơn.',
      ),
      beat(
        'Một khoản góp, hai nỗi lo',
        'Khi nghe tin người làm báo bị bắt, Năm hỏi khoản mình gửi có giúp được gì không. Anh Ba không hứa tiền sẽ giữ được tờ báo. Cậu thất vọng vì muốn có một việc nhỏ làm xong là yên tâm. Mẹ đặt cuốn tập mới trước mặt cậu.',
        [
          [
            'Anh Ba',
            'Anh không biết nó giúp được tới đâu. Nhưng không vì vậy mà lời hỏi của em thành vô nghĩa.',
          ],
          ['Mẹ Năm', 'Con còn lo thì cứ nói. Đừng nghĩ đã cho tiền là không được sợ nữa.'],
        ],
        [
          ask(
            'Năm còn muốn góp không?',
            'Năm',
            'Con muốn hỏi người nhận cần gì trước. Có thể con đọc giúp, có thể giữ lại giấy. Con không muốn cứ lo là đem tiền ra, như vậy con cũng đâu hiểu chuyện hơn.',
          ),
          ask(
            'Cậu sợ điều gì nhất?',
            'Năm',
            'Sợ người lớn nói đừng hỏi nữa. Con còn nhiều chỗ không biết, nhưng có khi mọi người mệt nên con lại cất câu hỏi đi.',
          ),
        ],
        'Mình sẽ hồi âm điều mình biết và điều mình chưa thể hứa. Sự tin cậy không cần một lời bảo đảm giả.',
      ),
    ],
    ending:
      'Hộp xu còn một khoản nhỏ cho lần mua tập sau. Năm không ghi mình đã cứu được ai. Cậu ghi đã hỏi điều cần hỏi và đã để dành cho việc học.',
  },
  {
    id: 'questionbook',
    station: 'press',
    label: 'Tập những câu chưa hiểu',
    reader: 'nam',
    related: 'rent-slip',
    sound: 'book',
    arrival:
      'Năm nhờ anh Ba mang đến bản chép những câu hỏi sau buổi đọc. Lề giấy có chỗ dành riêng cho câu trả lời chưa có.',
    scenes: [
      beat(
        'Biết đọc chưa phải biết hết',
        'Năm thích được gọi sang đọc báo. Một tối chị Tư hỏi cậu một chữ, cậu giải thích bằng một chữ khác khó hơn. Chị gật, nhưng hôm sau vẫn hỏi lại. Cậu mới nhận ra cái gật không có nghĩa chị đã hiểu.',
        [
          ['Năm', 'Con sợ nói không biết thì lần sau không ai gọi nữa. Nên con cứ nói thêm.'],
          ['Chị Tư', 'Tôi cũng sợ hỏi hoài làm cậu ngại. Vậy là hai người cứ giả bộ đã hiểu nhau.'],
        ],
        [
          ask(
            'Năm đã sửa cách đọc thế nào?',
            'Năm',
            'Con hỏi chị muốn nghe lại đoạn nào, không hỏi chị hiểu chưa cho có. Chỗ con chưa biết, con đánh dấu để hỏi.',
          ),
          ask(
            'Chị Tư có dễ hỏi hơn không?',
            'Chị Tư',
            'Dễ hơn khi cậu chịu nói cậu cũng chưa rõ. Tôi không còn tưởng chỉ mình ít chữ nên phải hỏi nhiều.',
          ),
        ],
        'Mình cần những câu hỏi thật hơn một cái gật. Bài dễ đọc còn phải giúp người đọc biết chỗ nào cần hỏi.',
      ),
      beat(
        'Câu trả lời bị gạch đi',
        'Năm chép một lời người quen kể vào tập rồi phát hiện không có căn cứ. Cậu định xé trang đó vì xấu hổ. Anh Ba bảo giữ nét gạch, ghi bên cạnh vì sao sửa. Người đọc sau còn biết cậu đã đổi ý ở đâu.',
        [
          [
            'Năm',
            'Con tưởng làm thầy thì phải biết sẵn. Nhìn trang gạch nhiều quá, con thấy mình chưa giống người dạy học chút nào.',
          ],
          ['Anh Ba', 'Nếu em giữ câu sai cho đẹp tập, người đọc sau biết theo cái gì?'],
        ],
        [
          ask(
            'Cậu ghi lý do sửa ra sao?',
            'Năm',
            'Con ghi trước đây nghe kể, chưa đối chiếu. Không đổ cho người đã kể. Chính con cũng đã chép mà chưa hỏi.',
          ),
          ask(
            'Năm có dám đọc trang sửa cho chị Tư?',
            'Năm',
            'Có. Chị bảo giữ trang đó, vì chị cũng cần nhớ câu cũ không đúng. Con vẫn ngại, nhưng không còn muốn giấu hết.',
          ),
        ],
        'Mình cũng cần sửa rõ ràng khi viết sai. Sự cẩn thận có thể bắt đầu bằng việc nhận ra một lần mình đã không cẩn thận.',
      ),
      beat(
        'Đoạn còn nợ người nghe',
        'Sau tin khám xét, Năm nghĩ chỉ cần tìm được một số báo mới là yên tâm. Nhưng chị Tư nhắc cậu còn nợ đoạn đã hứa đọc hôm trước. Cậu mở tờ cũ, ghi ngày của nó rồi bắt đầu lại. Có điều cần biết ngay; cũng có điều cần hiểu cho xong.',
        [
          [
            'Chị Tư',
            'Đừng bỏ đoạn cũ chỉ vì có chuyện mới. Hôm trước tôi hỏi, cậu bảo sẽ tìm rồi nói lại.',
          ],
          [
            'Năm',
            'Con không muốn câu hỏi của chị biến mất giữa những chuyện lớn. Con viết nó ở trang đầu để còn nhớ.',
          ],
        ],
        [
          ask(
            'Nếu chưa tìm được câu trả lời thì sao?',
            'Năm',
            'Con nói chưa tìm được, rồi giữ chỗ đó. Hứa hỏi lại không có nghĩa hôm sau phải bịa được lời đáp.',
          ),
          ask(
            'Năm còn muốn làm thầy không?',
            'Năm',
            'Còn. Nhưng con nghĩ mình phải học cách chờ người khác hỏi, và nhớ lời đã hứa. Biết nhiều chữ thôi chắc chưa đủ.',
          ),
        ],
        'Trang báo có thời hạn. Lời mình đã nhận từ người đọc thì không hết hạn chỉ vì một chuyện mới xuất hiện.',
      ),
    ],
    ending:
      'Trang đầu vẫn ghi đoạn còn nợ chị Tư. Bên dưới đã có ngày hẹn đọc lại. Mình không khép câu chuyện bằng một câu em đã thành thầy, mà bằng việc em đang học cách giữ lời.',
  },
];

export const readerForStory = (story) => readers[story.reader];
